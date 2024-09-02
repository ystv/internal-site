import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import * as People from "@/features/people";
import { jwtDecode } from "jwt-decode";
import { mustGetCurrentUser } from "../server";
import invariant from "@/lib/invariant";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export type SlackTokenJson = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
  nonce: string;
  at_hash: string;
  "https://slack.com/team_id": string;
  "https://slack.com/user_id": string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
};

export async function getSlackUserInfo(code: string, redirect?: string | null) {
  invariant(isSlackEnabled, "Slack is not enabled");
  const slackApp = await slackApiConnection();
  const tokenResponse = await slackApp.client.openid.connect.token({
    client_id: env.SLACK_CLIENT_ID || "",
    client_secret: env.SLACK_CLIENT_SECRET || "",
    code: code,
    redirect_uri: `${env.PUBLIC_URL}/login/slack/callback${
      redirect ? "?redirect=" + redirect : ""
    }`,
  });
  const token = jwtDecode(tokenResponse.id_token!) as SlackTokenJson;
  return token;
}

export async function findOrCreateUserFromSlackToken(userInfo: SlackTokenJson) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          identities: {
            some: {
              provider: "slack",
              provider_key: userInfo["https://slack.com/user_id"],
            },
          },
        },
        {
          email: {
            equals: userInfo.email,
          },
        },
      ],
    },
    include: {
      identities: true,
    },
  });
  if (user) {
    await prisma.identity.upsert({
      where: {
        provider_provider_key: {
          provider: "slack",
          provider_key: userInfo["https://slack.com/user_id"],
        },
      },
      update: {},
      create: {
        provider: "slack",
        provider_key: userInfo["https://slack.com/user_id"],
        user_id: user.user_id,
      },
    });

    return user;
  }
  return prisma.user.create({
    data: {
      first_name: userInfo.given_name!,
      last_name: userInfo.family_name!,
      email: userInfo.email!,
      username: userInfo.email!.split("@")[0],
      avatar: userInfo.picture!,
      identities: {
        create: {
          provider: "slack",
          provider_key: userInfo["https://slack.com/user_id"],
        },
      },
    },
    include: {
      identities: true,
    },
  });
}
