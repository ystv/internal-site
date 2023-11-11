import { App } from "@slack/bolt";

declare global {
  var slack: App; // This must be a `var` and not a `let / const`
}

let app = global.slack;

if (!app) {
  app = global.slack = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
  });

  (async () => await app.start())();
}

async function slackConnect() {
  return app;
}

function checkEnabled() {
  if (
    process.env.SLACK_ENABLED?.toLowerCase() === "true" &&
    process.env.SLACK_BOT_TOKEN &&
    process.env.SLACK_APP_TOKEN &&
    process.env.SLACK_SIGNING_SECRET &&
    process.env.SLACK_CLIENT_ID &&
    process.env.SLACK_CLIENT_SECRET
  ) {
    return true;
  }
  return false;
}

export default slackConnect;

export const isSlackEnabled = checkEnabled();
