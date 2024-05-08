import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import * as People from "@/features/people";
import { jwtDecode } from "jwt-decode";
import { mustGetCurrentUser } from "../server";
import invariant from "@/lib/invariant";
import { prisma } from "@/lib/db";

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

export async function getSlackUserInfo(code: string) {
  invariant(isSlackEnabled, "Slack is not enabled");
  const slackApp = await slackApiConnection();
  const tokenResponse = await slackApp.client.openid.connect.token({
    client_id: process.env.SLACK_CLIENT_ID || "",
    client_secret: process.env.SLACK_CLIENT_SECRET || "",
    code: code,
    redirect_uri: `${process.env.PUBLIC_URL}/login/slack/callback`,
  });
  const token = jwtDecode(tokenResponse.id_token!) as SlackTokenJson;
  return token;
}

export async function saveSlackUserInfo(userInfo: SlackTokenJson) {
  invariant(isSlackEnabled, "Slack is not enabled");
  const user = await mustGetCurrentUser();

  await People.setUserSlackID(
    user.user_id,
    userInfo["https://slack.com/user_id"],
  );
}

export async function findOrCreateUserFromSlackToken(userInfo: SlackTokenJson) {
  const user = await prisma.user.findFirst({
    where: {
      identities: {
        some: {
          provider: "slack",
          provider_key: userInfo["https://slack.com/user_id"],
        },
      },
    },
  });
  if (user) {
    return user;
  }
  console.log(userInfo);
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
          provider_key: userInfo.sub,
        },
      },
    },
  });
}
