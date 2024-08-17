import { createServer } from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { z } from "zod";
import { authenticateSocket, isServerSocket } from "./auth";
import { env, validateEnv } from "../lib/env.js";

const dev = env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export type TSocket = Socket;

export type TServer = Server;

var io: TServer;

validateEnv();

env;

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
