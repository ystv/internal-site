import { App } from "@slack/bolt";
import { env } from "../env";

declare global {
  var slack: App | undefined; // This must be a `var` and not a `let / const`
}

export const isSlackEnabled = env.SLACK_ENABLED === "true";

async function slackApiConnection() {
  if (!isSlackEnabled) {
    throw new Error("Slack is not enabled");
  }
  if (!global.slack) {
    global.slack = new App({
      token: env.SLACK_BOT_TOKEN,
      signingSecret: env.SLACK_SIGNING_SECRET,
      socketMode: env.SLACK_DISABLE_SOCKET_MODE !== "true",
      port: 0, // We never want it to listen on a port
      appToken: env.SLACK_APP_TOKEN,
      redirectUri: `${env.PUBLIC_URL}/login/slack/callback`,
      installerOptions: {
        redirectUriPath: "/login/slack/callback",
      },
    });
  }

  return global.slack;
}

export default slackApiConnection;
