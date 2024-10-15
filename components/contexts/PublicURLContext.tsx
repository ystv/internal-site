"use client";
import { createContext, useContext, type ReactNode } from "react";

export const PublicURLContext = createContext<string>("");

export function usePublicURL() {
  return useContext(PublicURLContext);
}

export function PublicURLProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  return (
    <PublicURLContext.Provider value={value}>
      {children}
    </PublicURLContext.Provider>
  );
}
