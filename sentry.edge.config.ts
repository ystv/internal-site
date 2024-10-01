// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://750c97f627ca96a99527a482485036bd@o4505767139016704.ingest.sentry.io/4505975961288704",
  release: process.env.NEXT_PUBLIC_RELEASE,
  environment: process.env.ENVIRONMENT ?? "local",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [],

  beforeSend(event) {
    // Filter out errors during the Next.js build phase
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return null;
    }
    // Filter out errors on localhost - the jenkins builds set NODE_ENV=production on all envs
    if (process.env.NODE_ENV !== "production") {
      return null;
    }
    return event;
  },
});
