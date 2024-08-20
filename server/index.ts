import { createServer as createHttpsServer } from "node:https";
import {
  createServer as createHttpServer,
  Server as HttpServer,
} from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";
import { z } from "zod";
import { authenticateSocket, isServerSocket } from "./auth";
import { env, validateEnv } from "../lib/env.js";
import { readFileSync } from "node:fs";

const dev = env.NODE_ENV !== "production";
const doSSL = env.DEV_SSL == "1"; // Used to decide whether or not to use https in a dev environment
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export type TSocket = Socket;
export type TServer = Server;

var io: TServer;

validateEnv();

app.prepare().then(async () => {
  let httpServer: HttpServer;

  if (doSSL) {
    const cert = await readFileSync(process.cwd() + "/certificates/cert.pem");
    const key = await readFileSync(process.cwd() + "/certificates/key.pem");

    httpServer = createHttpsServer({ key: key, cert: cert }, handler);
  } else {
    httpServer = createHttpServer(handler);
  }

  io = new Server(httpServer);

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    socket.onAny((eventName, value, ...args) => {
      const eventNameParse = parseEventName(eventName);

      switch (eventNameParse) {
        case "userUpdate":
          if (isServerSocket(socket)) {
            io.in(`userOnly:id:${eventName.split(":")[2]}`).emit(
              `userUpdate:me`,
            );
          }

          break;
        case "signupSheetUpdate":
          io.in("authenticatedUsers").emit(
            `signupSheetUpdate:${eventName.split(":")[1]}`,
          );
          break;
        default:
          break;
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
      console.log(`> Ready on http${doSSL ? "s" : ""}://${hostname}:${port}`);
    });
});

function parseEventName(
  eventNameAny: any,
): z.infer<typeof socketEventNames> | undefined {
  const eventNameString = z.string().safeParse(eventNameAny);

  if (!eventNameString.success) {
    return undefined;
  }

  const eventName = socketEventNames.safeParse(
    eventNameString.data.split(":")[0],
  );

  if (!eventName.success) {
    return undefined;
  }

  return eventName.data;
}

const socketEventNames = z.enum(["userUpdate", "signupSheetUpdate"]);
