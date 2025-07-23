import "server-only";

import { type Server } from "socket.io";

export const io = (globalThis as unknown as { io: Server }).io;

export * from "./signUpSheet";
