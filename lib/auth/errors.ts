import { Permission } from "@/lib/auth/common";

const NOT_LOGGED_IN = "Not logged in";

export class NotLoggedIn extends Error {
  constructor() {
    super(NOT_LOGGED_IN);
  }
}

export function isNotLoggedIn(err: Error): err is NotLoggedIn {
  return err.message === NOT_LOGGED_IN;
}

export class Forbidden extends Error {
  constructor(required: Permission[]) {
    super(`Missing required permission: ${required.join(", ")}`);
  }
}
