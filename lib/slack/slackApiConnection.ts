import { App } from "@slack/bolt";
import { env } from "../env";

declare global {
  var slack: App; // This must be a `var` and not a `let / const`
}

let app = global.slack;

export const isSlackEnabled = env.SLACK_ENABLED == true;

if (!app && isSlackEnabled) {
  app = global.slack = new App({
    token: env.SLACK_BOT_TOKEN,
    signingSecret: env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: env.SLACK_APP_TOKEN,
    redirectUri: `${env.PUBLIC_URL}/login/slack/callback`,
    installerOptions: {
      redirectUriPath: "/login/slack/callback",
    },
  });

  (async () => await app.start())();
}

async function slackApiConnection() {
  return app;
}

export default slackApiConnection;
