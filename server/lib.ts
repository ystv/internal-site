import { Prisma } from "@prisma/client";
import { readFileSync } from "fs";
import { RequestHandler } from "next/dist/server/next";
import {
  createServer as createHttpServer,
  Server as HttpServer,
} from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { exit } from "process";
import { prisma } from "../lib/db";

export async function checkDatabaseConnection() {
  return new Promise<void>(async (resolve, reject) => {
    let connectionAttempts = 1;

    while (connectionAttempts <= 3) {
      try {
        await prisma.$executeRaw(Prisma.sql`SELECT 1;`);
        return resolve();
      } catch (e) {
        console.error(
          `Database connection attempt ${connectionAttempts} failed, retrying...`,
        );
        await sleep(5000);
      }
      connectionAttempts += 1;
    }
    if (connectionAttempts > 3) {
      console.error(
        "Connection to database failed, exiting. Please check your configuration.",
      );
      exit(1);
    }
  });
}

export async function prepareHttpServer(
  handler: RequestHandler,
  doSSL: boolean,
): Promise<HttpServer> {
  let httpServer: HttpServer;

  if (doSSL) {
    const cert = await readFileSync(process.cwd() + "/certificates/cert.pem");
    const key = await readFileSync(process.cwd() + "/certificates/key.pem");

    httpServer = createHttpsServer({ key: key, cert: cert }, handler);
  } else {
    httpServer = createHttpServer(handler);
  }

  return httpServer;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
