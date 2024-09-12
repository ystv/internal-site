import { App } from "@slack/bolt";
import { env } from "../env";

export const isSlackEnabled = env.SLACK_ENABLED === "true";

async function slackApiConnection() {
  return new App({
    token: env.SLACK_BOT_TOKEN,
    signingSecret: env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: env.SLACK_APP_TOKEN,
    redirectUri: `${env.PUBLIC_URL}/login/slack/callback`,
    installerOptions: {
      redirectUriPath: "/login/slack/callback",
    },
  });
}

export default slackApiConnection;
