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
import { authenticateSocket, isServerSocket } from "./auth";

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
      console.log(`> Ready on http://${hostname}:${port}`);
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
