import { prisma } from "../lib/db";
import { decode } from "../lib/sessionSecrets";
import { z } from "zod";
import { TSocket } from ".";
import { ExtendedError } from "socket.io/dist/namespace";
import { env } from "../lib/env";

export async function authenticateSocket(
  socket: TSocket,
  next: (err?: ExtendedError | undefined) => void,
) {
  if (Object.hasOwn(socket.data, "auth")) {
    return next();
  }

  if (Object.hasOwn(socket.handshake.auth, "secret")) {
    if (
      socket.handshake.auth.secret === env.SESSION_SECRET &&
      socket.handshake.headers["user-agent"] == "node-XMLHttpRequest"
    ) {
      socket.data.auth = {
        authenticated: true,
        isClient: false,
      };
      return next();
    } else {
      socket.disconnect();
      return next(new Error("Unauthenticated"));
    }
  }

  const cookie = parseCookie(socket.client.request.headers.cookie);

  const sessionCookie: string | undefined = cookie["ystv-calendar-session"];

  if (sessionCookie) {
    const session = z
      .object({
        userID: z.number(),
      })
      .parse(await decode(sessionCookie));

    const user = await prisma.user.findFirst({
      where: {
        user_id: session.userID,
      },
    });

    if (user !== null) {
      socket.data.auth = {
        authenticated: true,
        isClient: true,
        user: user,
      };

      socket.join(`userOnly:id:${user.user_id}`);
      socket.join(`authenticatedUsers`);
      return next();
    } else {
      socket.data.auth = {
        authenticated: false,
      };
      return next();
    }
  } else {
    socket.data.auth = {
      authenticated: false,
    };
    return next();
  }

  return next();
}

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

export function isServerSocket(socket: TSocket) {
  return (
    socket.data.auth.authenticated == true && socket.data.auth.isClient == false
  );
}
