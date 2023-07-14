"use client";

import { createContext, useContext, useMemo } from "react";
import { Permission } from "@/lib/auth/common";

const PermissionsContext = createContext<Permission[]>([]);

export function PermissionsProvider(props: {
  children: React.ReactNode;
  permissions: Permission[];
}) {
  return (
    <PermissionsContext.Provider value={props.permissions}>
      {props.children}
    </PermissionsContext.Provider>
  );
}

export const useUserPermissions = () => useContext(PermissionsContext);

export function PermissionGate(props: {
  children: React.ReactNode;
  required: Permission | Permission[];
  fallback?: React.ReactNode;
}) {
  const userPermissions = useUserPermissions();
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
