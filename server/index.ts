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
import {
  App,
  LinkSharedEvent,
  LinkUnfurls,
  MessageAttachment,
} from "@slack/bolt";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
});

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

slackApp.message("hello", async ({ message, body, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there!`);
});

slackApp.event("link_shared", async ({ event, client, logger }) => {
  // Proudly stolen from Expedia
  // https://github.com/ExpediaGroup/insights-explorer/blob/0ec611f903e15857d29993543b61e3618c416b5e/packages/slackbot/src/app.ts#L43C3-L58C4
  const tuples = await Promise.all(
    event.links.map(async (link) => ({ link, unfurl: await getUnfurl(link) })),
  );

  const unfurls = tuples
    .filter(({ unfurl }) => unfurl !== undefined)
    .reduce<LinkUnfurls>((accumulator, { link, unfurl }) => {
      accumulator[link.url] = unfurl!;
      return accumulator;
    }, {});

  if (Object.keys(unfurls).length > 0) {
    client.chat.unfurl({
      ts: event.message_ts,
      channel: event.channel,
      unfurls,
    });
  }
});

(async () => {
  // Start your app
  await slackApp.start();

  console.log("⚡️ Bolt app is running!");
})();

async function getUnfurl({
  url,
  domain,
}: {
  url: string;
  domain: string;
}): Promise<MessageAttachment> {
  const trailingPath = url.substring(
    url.indexOf(domain) + domain.length,
    url.length,
  );

  let route: string;

  if (trailingPath.includes("?")) {
    route = trailingPath.substring(0, trailingPath.indexOf("?"));
  } else {
    route = trailingPath;
  }

  if (route.startsWith("/calendar/")) {
    const event = await prisma.event.findFirst({
      where: {
        event_id: Number(route.split("/")[2]),
      },
    });

    if (event) {
      return {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${event.name}*`,
            },

            fields: [
              {
                type: "mrkdwn",
                text: "*Start Time*",
              },
              {
                type: "mrkdwn",
                text: "*End Time*",
              },
              {
                type: "plain_text",
                text: event.start_date.toLocaleString(),
              },
              {
                type: "plain_text",
                text: event.end_date.toLocaleString(),
              },
            ],
          },
        ],
      };
    }
  }

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Event not found",
        },
      },
    ],
  };
}

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
