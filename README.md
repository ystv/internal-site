# YSTV Calendar

This is the repo for https://internal.ystv.co.uk.
Formerly known as `experimental-hypothetical-new-internal-site-idea`.

## Getting Started

To set up a local copy of the new calendar, you will need

- Node.js (18 or later) - https://nodejs.org/en/download
- Yarn - once you have Node installed, run `corepack enable`
- PostgreSQL - https://www.postgresql.org/download/
- Git - https://git-scm.com/downloads
  - You will also need to configure authentication - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#authenticating-with-the-command-line

Then, clone this repository:

```sh
git clone git@github.com:ystv/internal-site.git
```

In the new folder, copy the `.env.example` file to `.env`.

Then run `yarn` to install all the dependencies.

You will also need to set up the following:

### Postgres Database

Once you have PostgreSQL installed, run `createdb calendar_2023`.

Now run `yarn prisma db push` to set up the database tables.
If you get a permissions error, check your PostgreSQL authentication settings - you should have a `local all all peer` line in your pg_hba.conf.
You may also need to run `yarn prisma db seed` to set up initial data.

### Google OAuth Keys

Go to https://console.developers.google.com and create a new project.
Go to "OAuth Consent Screen" and fill out all the information (it doesn't matter for testing) - make sure you select "External" as the very first step.
Then go to "Credentials".
Create an OAuth Client ID, select "Web Application" as the type, and copy the Client ID.

Edit your `.env.local` and add the Client ID on the `GOOGLE_CLIENT_ID=` line. You should also set `GOOGLE_PERMITTED_DOMAINS=` to `york.ac.uk`.

Also add `http://localhost` and `http://localhost:3000` to both the "Authorised JavaScript origins" and "Authorised redirect URIs" sections (Or whatever origin/domain your instance will be hosted on).

Also ensure to set the `SESSION_SECRET` in `.env`, this can be whatever random string you'd like in development.

### Slack Integration (Optional)

If you would like to setup the optional slack integration, head over to the [Slack Setup](/docs/setup_slack.md) docs to get started.

## Running

Finally, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To get admin permissions, sign in once with Google, then run `yarn do promoteUser <your email>`.

## Structure

- app/ - pages
<!-- TODO - https://linear.app/ystv/issue/WEB-101/api-time
- app/api/ - api routes (trpc and REST)
  -->
- features/ - business logic functinality
- lib/ - low level utilities (auth, db, etc.)

## Development

We use [Linear](https://linear.app/ystv) to track issues - to access it, sign in with your @ystv.co.uk Google account (ask a Computing Team member if you don't have one).
