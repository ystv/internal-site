"use server";

import io from "socket.io-client";
const socket = io("http://localhost:3000", {
  auth: {
    secret: process.env.SESSION_SECRET,
  },
});

export async function pingPong() {
  // socket.emit("ping-pong", "ffs");
  // console.log("Server socket: ", socket.id);
}
