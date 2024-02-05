import type { Permission } from "@/lib/auth/permissions";

const NOT_LOGGED_IN = "Not logged in";

export class NotLoggedIn extends Error {
  constructor(message?: string) {
    super(message ? NOT_LOGGED_IN + ": " + message : NOT_LOGGED_IN);
  }
}

export function isNotLoggedIn(err: Error): err is NotLoggedIn {
  return err.message.startsWith(NOT_LOGGED_IN);
}

export class Forbidden extends Error {
  constructor(required: Permission) {
    super(`Missing required permission: ${required}`);
  }
}

export class ForbiddenAny extends Error {
  constructor(required: any) {
    super(`Missing required permission: ${required}`);
  }
}
