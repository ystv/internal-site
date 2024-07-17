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
    console.log(socket.data.auth);

    socket.on("ping", (value) => {
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
      const eventNameString = eventName as string;

      if (eventNameString.startsWith("userUpdate:id:")) {
        if (isServerSocket(socket)) {
          io.in(`userOnly:id:${eventName.split(":")[2]}`).emit(`userUpdate:me`);
        }
      } else if (eventNameString.startsWith("signupSheetUpdate:")) {
        io.in("authenticatedUsers").emit(
          `signupSheetUpdate:${eventName.split(":")[1]}`,
        );
      }
    });

    // socket.on("disconnect", (reason, description) => {
    //   console.log(socket.id, " disconnected");
    // });
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
