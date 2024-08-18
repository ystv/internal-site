import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  auth: {
    secret: process.env.SESSION_SECRET,
  },
});
