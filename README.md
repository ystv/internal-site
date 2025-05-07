# YSTV Internal Site

This is the repo for https://internal.ystv.co.uk.
Formerly known as `experimental-hypothetical-new-internal-site-idea`.

## Getting Started

To set up a local copy of the new internal site, you will need

- Node.js (18 or later) - https://nodejs.org/en/download
- Yarn - once you have Node installed, run `corepack enable`
- PostgreSQL - https://www.postgresql.org/download/
- Git - https://git-scm.com/downloads
  - You will also need to configure authentication - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#authenticating-with-the-command-line

If you wish to setup SSL for local development you will also need

- mkcert - https://github.com/FiloSottile/mkcert

Then, clone this repository:

```sh
git clone git@github.com:ystv/internal-site.git
```

In the new folder, copy the `.env.example` file to `.env`.

Then run `yarn` to install all the dependencies.

You will also need to set up the following:

### Postgres Database

Once you have PostgreSQL installed, run `createdb internal_site`.

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

If you would like to setup the optional slack integration, head over to the [Slack Setup](/docs/setup_slack.md) docs to get started. You will also need to have setup localhost SSL to be able to sign in.

### Localhost ssl (Optional but required for slack integration)

To install the local root CA and generate the certificates:

```bash
yarn ssl:generateCerts
```

## Running

Finally, run the development server:

```bash
yarn dev
```

or for SSL

```bash
yarn devSSL
```

Open [http://localhost:3000](http://localhost:3000) or [https://localhost:3000](https://localhost:3000) with your browser to see the result.

To get admin permissions, sign in once with Google, then run `yarn do promoteUser <your email>`.

## Development

There are some docs written for developing specific features but otherwise looking at the code and the [Next.js documentation](https://nextjs.org/docs) is the best place to get started.

Feature specific docs:

- [Socket.io communication](/docs/development/implementing_socket_io.md)

## Structure

- app/ - pages
- features/ - business logic functinality
- lib/ - low level utilities (auth, db, etc.)
- server/ - custom server that handles socket.io communication

## Contributing

Some documentation about how to contribute and some standards to follow is available [here](/docs/contributing.md)
