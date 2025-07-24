"use client";

import { type ReactNode, createContext, useContext } from "react";

import { type TSocket, useCreateSocket } from "@/lib/socket";

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
