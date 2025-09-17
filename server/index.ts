import { type App } from "@slack/bolt";
import * as Minio from "minio";
import next from "next";
import { Server } from "socket.io";

import { authenticateSocket } from "./auth";
import { checkDatabaseConnection, prepareHttpServer } from "./lib";
import { env, validateEnv } from "../lib/env.js";
import { isMinioEnabled, minioClient } from "../lib/minio";
import { setupActionHandlers } from "../lib/slack/actions";
import {
  createSlackApp,
  isSlackEnabled,
} from "../lib/slack/slackApiConnection";

const dev = env.NODE_ENV !== "production";
const doSSL = env.DEV_SSL === "true";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

var io: Server;

validateEnv();

app.prepare().then(async () => {
  const httpServer = await prepareHttpServer(handler, doSSL);

  await checkDatabaseConnection();

  let slackApp: App | undefined;

  if (isSlackEnabled) {
    slackApp = createSlackApp();

    await setupActionHandlers(slackApp);
  }

  if (isMinioEnabled) {
    const exists = await minioClient.bucketExists(env.MINIO_BUCKET!);

    if (!exists) {
      console.error(`
        Failed to connect to bucket ${env.MINIO_BUCKET} at ${
          env.MINIO_ENDPOINT
        } ${env.MINIO_USE_SSL === "true" ? "using SSL" : "without SSL"}`);
    }
  }

  io = new Server(httpServer);
  (globalThis as unknown as { io: Server }).io = io;

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    if (socket.data.auth.invalidSession === true) {
      socket.emit("invalidSession");
    }
  });

  if (slackApp) await slackApp.start();

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http${doSSL ? "s" : ""}://${hostname}:${port}`);
    });
});
