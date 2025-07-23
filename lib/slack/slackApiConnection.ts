import { App } from "@slack/bolt";

import { env } from "../env";
import invariant from "../invariant";

declare global {
  var slack: App | undefined; // This must be a `var` and not a `let / const`
}

export const isSlackEnabled = env.SLACK_ENABLED === "true";

function slackApiConnection(): App {
  invariant(
    isSlackEnabled,
    "slackApiConnection was called but slack is not enabled on this instance",
  );
  invariant(
    (globalThis as unknown as { slackApp: App | undefined }).slackApp,
    "A global slack app has not been initialised",
  );

  return (globalThis as unknown as { slackApp: App }).slackApp;
}

export function createSlackApp(): App {
  invariant(
    (globalThis as unknown as { slackApp: App | undefined }).slackApp,
    "createSlackApp was called but a global app already exists",
  );

  (globalThis as unknown as { slackApp: App }).slackApp = new App({
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

  return (globalThis as unknown as { slackApp: App }).slackApp;
}

export default slackApiConnection;
