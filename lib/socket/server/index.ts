import { env } from "@/lib/env";
import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  auth: {
    secret: env.SESSION_SECRET,
  },
});
