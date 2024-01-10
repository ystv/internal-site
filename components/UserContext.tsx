"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { Permission } from "@/lib/auth/permissions";
import { UserType } from "@/lib/auth/server";
import * as Sentry from "@sentry/nextjs";
import { preferenceDefaults } from "@/features/people/preferences";

const UserContext = createContext<UserType>(
  null as unknown as UserType /* A bit naughty, but getCurrentUser ensures there's a user signed in */,
);

export function UserProvider(props: {
  children: React.ReactNode;
  user: UserType;
}) {
  useEffect(() => {
    Sentry.setUser({
      id: props.user.user_id,
      username: props.user.username,
      email: props.user.email,
    });
  }, [props.user]);
  return (
    <UserContext.Provider value={props.user}>
      {props.children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = () => useContext(UserContext);

export function useUserPreferences(): Required<PrismaJson.UserPreferences> {
  const user = useCurrentUser();
  return preferenceDefaults(user.preferences);
}

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
