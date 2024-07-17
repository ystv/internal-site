import { createServer } from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";
import { encode as b64Encode, decode as b64Decode } from "base64-arraybuffer";
import { prisma } from "../lib/db";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { decode } from "../lib/sessionSecrets";
import { z } from "zod";
import * as crypto from "crypto";
import { ExtendedError } from "socket.io/dist/namespace";
import { authenticateSocket } from "./auth";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export type TSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export type TServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

var io: TServer;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer);

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    console.log("New Connection! ", socket.id);
    console.log(socket.data.auth);

    socket.on("ping", (value) => {
      console.log("Hello!");
      console.log(io.engine.clientsCount);
      io.emit("pong", value);
    });

    socket.on("message:send", (value) => {
      io.emit(
        "message:receive",
        `${socket.data.auth.user?.first_name ?? "unknown"}: ${value}`,
      );
    });

    socket.onAny((eventName, value, ...args) => {
      console.log("Catch-all: ", eventName);

      const eventNameString = eventName as string;

      if (eventNameString.startsWith("userUpdate:id:")) {
        if (isServerSocket(socket)) {
          console.log(eventName.split(":")[2] as number);

          io.in(`userOnly:id:${eventName.split(":")[2]}`).emit(`userUpdate:me`);
        }
      } else if (eventNameString.startsWith("signupSheetUpdate:")) {
        console.log("Updating Sheet!");

        io.in("authenticatedUsers").emit(
          `signupSheetUpdate:${eventName.split(":")[1]}`,
        );
      }
    });

    // socket.onAnyOutgoing((eventName, ...args) => {
    //   console.log("Catch-all outgoing: ", eventName);
    // });

    socket.on("disconnect", (reason, description) => {
      console.log(socket.id, " disconnected");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

export function parseCookie(cookie: string | undefined) {
  if (cookie == undefined) return {};
  return cookie
    .split(";")
    .map((value) => value.split("="))
    .reduce((acc: any, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}

function isServerSocket(socket: TSocket) {
  return (
    socket.data.auth.authenticated == true && socket.data.auth.isClient == false
  );
}

// async function decode(tok: string) {
//   const [signature, encodedPayload] = tok.split(".");
//   if (
//     !(await crypto.subtle.verify(
//       {
//         name: "HMAC",
//         hash: "SHA-256",
//       },
//       await getKey(),
//       hexDecode(signature),
//       hexDecode(encodedPayload),
//     ))
//   ) {
//     throw new Error("Invalid signature");
//   }
//   const data = JSON.parse(new TextDecoder().decode(hexDecode(encodedPayload)));
//   return data;
// }

// async function getKey() {
//   if (!key) {
//     invariant(process.env.SESSION_SECRET, "no SESSION_SECRET set");
//     key = await crypto.subtle.importKey(
//       "raw",
//       new TextEncoder().encode(process.env.SESSION_SECRET),
//       {
//         name: "HMAC",
//         hash: "SHA-256",
//       },
//       false,
//       ["sign", "verify"],
//     );
//   }
//   return key;
// }

// function invariant(cond: any, message: string) {
//   if (!cond) {
//     throw new Error("Invariant violation: " + message);
//   }
// }

// function hexDecode(str: string) {
//   return b64Decode(urlbase64Unescape(str));
// }

// function urlbase64Unescape(str: string) {
//   return (str + "===".slice((str.length + 3) % 4))
//     .replace(/-/g, "+")
//     .replace(/_/g, "/");
// }
