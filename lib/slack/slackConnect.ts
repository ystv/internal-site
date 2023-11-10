import { App } from "@slack/bolt";

declare global {
  var slack: App; // This must be a `var` and not a `let / const`
}

// if (!MONGODB_URI) {
//   throw new Error(
//     'Please define the MONGODB_URI environment variable inside .env.local'
//   )
// }

let app = global.slack;

if (!app) {
  console.log("No app!");
  app = global.slack = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
  });

  (async () => await app.start())();
} else {
  console.log("App!");
}

async function slackConnect() {
  return app;

  console.log("Uh Oh app!");

  // app = new App({
  //   token: process.env.SLACK_BOT_TOKEN,
  //   signingSecret: process.env.SLACK_SIGNING_SECRET,
  //   socketMode: true,
  //   appToken: process.env.SLACK_APP_TOKEN,
  // });
  // await app.start()

  // return app;

  // if (cached.conn) {
  //   return cached.conn
  // }
  // if (!cached.promise) {
  //   const opts = {
  //     bufferCommands: false,
  //   }
  //   cached.promise = slack.connect(MONGODB_URI, opts).then((slack) => {
  //     return slack
  //   })
  // }
  // try {
  //   cached.conn = await cached.promise
  // } catch (e) {
  //   cached.promise = null
  //   throw e
  // }

  // return cached.conn
}

export default slackConnect;
