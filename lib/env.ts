import { z } from "zod";

const slackEnvType =
  process.env.SLACK_ENABLED == "true" ? z.string() : z.string().optional();

// export const env = { SESSION_SECRET: "", NODE_ENV: "" };

export function validateEnv() {
  if (process.env.SKIP_ENV_VALIDATION === "1") return;
  const envResult = envModel.safeParse(process.env);
  if (!envResult.success) {
    throw new Error(envResult.error.errors[0].message);
  }
  return;
}

/** @type z.infer<typeof envModel> */
export const env = process.env as unknown as z.infer<typeof envModel>;

const envModel = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  PUBLIC_URL: z
    .string()
    .url()
    .refine((str) => !str.endsWith("/"), "PUBLIC_URL must not end with a '/'"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_PERMITTED_DOMAINS: z.string(),
  ADAMRMS_EMAIL: z.string().optional(),
  ADAMRMS_PASSWORD: z.string().optional(),
  ADAMRMS_BASE: z.string().optional(),
  ADAMRMS_PROJECT_TYPE_ID: z.string().optional(),
  SESSION_SECRET: z.string(),
  SLACK_ENABLED: z.preprocess(
    (enabled) => (enabled === "true" ? true : false),
    z.boolean(),
  ),
  SLACK_BOT_TOKEN: slackEnvType,
  SLACK_APP_TOKEN: slackEnvType,
  SLACK_SIGNING_SECRET: slackEnvType,
  SLACK_CLIENT_ID: slackEnvType,
  SLACK_CLIENT_SECRET: slackEnvType,
  SLACK_TEAM_ID: z.string().optional(),
  SLACK_TECH_HELP_CHANNEL: z.string().default("#check-with-tech"),
  COOKIE_DOMAIN: z.string().default(new URL(process.env.PUBLIC_URL ?? "").host),
});

// export const env = createEnv({
//   /**
//    * Specify your server-side environment variables schema here. This way you can ensure the app
//    * isn't built with invalid env vars.
//    */
//   server: {
//     NODE_ENV: z
//       .enum(["development", "test", "production"])
//       .default("development"),
//     DATABASE_URL: z.string().url(),
//     PUBLIC_URL: z
//       .string()
//       .url()
//       .refine(
//         (str) => !str.endsWith("/"),
//         "PUBLIC_URL must not end with a '/'",
//       ),
//     GOOGLE_CLIENT_ID: z.string(),
//     GOOGLE_PERMITTED_DOMAINS: z.string(),
//     ADAMRMS_EMAIL: z.string().optional(),
//     ADAMRMS_PASSWORD: z.string().optional(),
//     ADAMRMS_BASE: z.string().optional(),
//     ADAMRMS_PROJECT_TYPE_ID: z.string().optional(),
//     SESSION_SECRET: z.string(),
//     SLACK_ENABLED: z.preprocess(
//       (enabled) => (enabled === "true" ? true : false),
//       z.boolean(),
//     ),
//     SLACK_BOT_TOKEN: slackEnvType,
//     SLACK_APP_TOKEN: slackEnvType,
//     SLACK_SIGNING_SECRET: slackEnvType,
//     SLACK_CLIENT_ID: slackEnvType,
//     SLACK_CLIENT_SECRET: slackEnvType,
//     SLACK_TEAM_ID: z.string().optional(),
//     SLACK_TECH_HELP_CHANNEL: z.string().default("#check-with-tech"),
//     COOKIE_DOMAIN: z
//       .string()
//       .default(new URL(process.env.PUBLIC_URL ?? "").host),
//   },

//   /**
//    * Specify your client-side environment variables schema here. This way you can ensure the app
//    * isn't built with invalid env vars. To expose them to the client, prefix them with
//    * `NEXT_PUBLIC_`.
//    */
//   client: {
//     // NEXT_PUBLIC_CLIENTVAR: z.string(),
//   },

//   /**
//    * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
//    * middlewares) or client-side so we need to destruct manually.
//    */
//   runtimeEnv: {
//     NODE_ENV: process.env.NODE_ENV,
//     DATABASE_URL: process.env.DATABASE_URL,
//     PUBLIC_URL: process.env.PUBLIC_URL,
//     GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//     GOOGLE_PERMITTED_DOMAINS: process.env.GOOGLE_PERMITTED_DOMAINS,
//     ADAMRMS_EMAIL: process.env.ADAMRMS_EMAIL,
//     ADAMRMS_PASSWORD: process.env.ADAMRMS_PASSWORD,
//     ADAMRMS_BASE: process.env.ADAMRMS_BASE,
//     ADAMRMS_PROJECT_TYPE_ID: process.env.ADAMRMS_PROJECT_TYPE_ID,
//     SESSION_SECRET: process.env.SESSION_SECRET,
//     SLACK_ENABLED: process.env.SLACK_ENABLED,
//     SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
//     SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN,
//     SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
//     SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
//     SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
//     SLACK_TEAM_ID: process.env.SLACK_TEAM_ID,
//     SLACK_TECH_HELP_CHANNEL: process.env.SLACK_TECH_HELP_CHANNEL,
//     COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
//   },
//   /**
//    * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
//    * useful for Docker builds.
//    */
//   skipValidation: !!process.env.SKIP_ENV_VALIDATION,
//   /**
//    * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
//    * `SOME_VAR=''` will throw an error.
//    */
//   emptyStringAsUndefined: true,
// });
