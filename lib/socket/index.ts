"use client";

import { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socket = io();

export type TSocket = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  isConnected: boolean;
  transport: string;
};

export function useCreateSocket(): TSocket {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    console.log("Socket re-rendered");

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("Connected: ", socket.id);
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket, isConnected, transport };
}
