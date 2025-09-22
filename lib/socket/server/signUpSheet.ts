import "server-only";

import { type Server } from "socket.io";

export async function socketUpdateSignupSheet(signupSheetID: number) {
  (globalThis as unknown as { io: Server }).io
    .in("authenticatedUsers")
    .emit(`signupSheetUpdate:${signupSheetID}`);
}
