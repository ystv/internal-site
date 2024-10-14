"use client";

import { useCreateSocket, type TSocket } from "@/lib/socket";
import { createContext, useContext, type ReactNode } from "react";

export const WebsocketContext = createContext<TSocket>(
  null as unknown as TSocket,
);

export function useWebsocket() {
  return useContext(WebsocketContext);
}

export function WebsocketProvider({ children }: { children: ReactNode }) {
  return (
    <WebsocketContext.Provider value={useCreateSocket()}>
      {children}
    </WebsocketContext.Provider>
  );
}
