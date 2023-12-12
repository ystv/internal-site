import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import * as People from "@/features/people";
import { jwtDecode } from "jwt-decode";
import { mustGetCurrentUser } from "../server";

type TokenJson = {
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
};

export async function saveSlackUserInfo(code: string) {
  if (isSlackEnabled) {
    const slackApp = await slackApiConnection();

    const user = await mustGetCurrentUser();

    const tokenResponse = await slackApp.client.openid.connect
      .token({
        client_id: process.env.SLACK_CLIENT_ID || "",
        client_secret: process.env.SLACK_CLIENT_SECRET || "",
        code: code,
      });
    const token = jwtDecode(tokenResponse.id_token!) as TokenJson;

    await People.setUserSlackID(
      user.user_id,
      token["https://slack.com/user_id"],
    );
  }
}
