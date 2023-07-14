"use client";

import { createContext, useContext, useMemo } from "react";
import { Permission } from "@/lib/auth/common";
import { User } from "@/lib/auth/legacy";

const UserContext = createContext<User>(
  null as unknown as User /* Bit naughty, but getCurrentUser ensures there's a user signed in */,
);

export function UserProvider(props: { children: React.ReactNode; user: User }) {
  return (
    <UserContext.Provider value={props.user}>
      {props.children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = () => useContext(UserContext);

export function PermissionGate(props: {
  children: React.ReactNode;
  required: Permission | Permission[];
  fallback?: React.ReactNode;
}) {
  const userPermissions = useCurrentUser().permissions;
  const ok = useMemo(
    () =>
      (Array.isArray(props.required)
        ? userPermissions.some((p) => props.required.includes(p))
        : userPermissions.includes(props.required)) ||
      userPermissions.includes("SuperUser"),
    [userPermissions, props.required],
  );
  if (ok) {
    return props.children;
  }
  return props.fallback ?? null;
}
