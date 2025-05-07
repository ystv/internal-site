# Setup Slack Integration

This will help you setup the slack integration for this project.

## Getting started

To start, you will need

- To have followed the [README](/README.md) to setup the main calendar site.
- A Slack account (obviously)
- A Slack workspace to setup the integration for

## Sidenote

These instructions are mostly copied from https://slack.dev/bolt-js/tutorial/getting-started which goes over the full process of setting up an app, however this page is more specific to the specific integration and covers the required scopes needed by the app itself.

## Setting up the app

### Creating the app

Head to https://api.slack.com/apps/new to create a new app using the account linked to your workspace.

Fill out a name for the app (can be changed later) and select the workspace to install it to. Hit `Create App` which will take you to your app's **Basic Information** page.

### Basic Information

From the basic information page, you will be able to copy three of the five required variables. Under **App Credentials**, copy `Client ID` to the variable `SLACK_CLIENT_ID` in `.env.local` (or wherever you may be storing your environment variables). `Client Secret` and `Signing Secret` can be copied to `SLACK_CLIENT_SECRET` and `SLACK_SIGNING_SECRET` respectively.

### Socket Mode

Navigate to the **Socket Mode** tab in the sidebar. From here, enable socket mode using the toggle switch, name the token when prompted, and click `Generate`. Copy the provided token (you are able to access it later) and paste it as the value of `SLACK_APP_TOKEN`.

### OAuth & Permissions

Navigate to the **OAuth & Permissions** tab in the sidebar. Under `Redirect URLs`, click `Add New Redirect URL` and enter `<calendar-instance-url>/login/slack/callback`. An example would be `https://internal.ystv.co.uk/login/slack/callback`.

Now we will go through the long process of adding the required scopes to the app. Scroll down to `Scopes` and under `Bot Token Scopes` click `Add an OAuthScope`. Add the following scopes:

- `channels:history`
- `channels:join`
- `channels:manage`
- `channels:read`
- `chat:write`
- `chat:write.public`
- `groups:history`
- `users.profile:read`
- `users:read`
- `users:read.email`

Sroll down slightly to `User Token Scopes` and add `team.read`.

You can now scroll up to the top of the page and click `Install to Workspace`. Click `Allow` when prompted. This should take you back to the **OAuth & Permissions** page. Towards the top of the page you should see `Bot User OAuth Token`. Copy the value of this over to `SLACK_BOT_TOKEN`.

## Setting up channels

This app uses a number of slack channels for integration with check-with-tech responses, feedback, and others. These three channels are:

- `SLACK_CHECK_WITH_TECH_CHANNEL` - Used for check-with-tech requests
- `SLACK_USER_FEEDBACK_CHANNEL` - Used for user feedback via the feedback form at the bottom of each page

Once you have channels you would like to use for this purpose, get the channel ID by copying the link of the channel and taking the last bit of the link that looks something like `C07J1G4L0BA` and set the variables accordingly.

## Enable Integration

Once these five variables are set, enable the integration by setting `SLACK_ENABLED` to `true`. If you start up your instance you should now be able to link your Slack account from your user profile and start assigning channels to events. If you have any questions ask Mia because she's probably made it a bit complicated.
