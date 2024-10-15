"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socket = io();

export type TSocket = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  isConnected: boolean;
  transport: string;
};

export function useCreateSocket(): TSocket {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("Socket connected: ", socket.id);
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onInvalidSession() {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    function onDisconnect() {
      console.log("Socket disconnected: ", socket.id);
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("invalidSession", onInvalidSession);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("invalidSession", onInvalidSession);
      socket.off("disconnect", onDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socket, isConnected, transport };
}
