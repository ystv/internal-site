import { z } from "zod";

const slackEnvType =
  process.env.SLACK_ENABLED == "true" ? z.string() : z.string().optional();

const envModel = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string(),
  PUBLIC_URL: z
    .string()
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
  SLACK_CHECK_WITH_TECH_CHANNEL: z.string().default("#check-with-tech"),
  SLACK_TECH_HELP_CHANNEL: z.string().default("#check-with-tech"),
  COOKIE_DOMAIN: z.string().default(new URL(process.env.PUBLIC_URL ?? "").host),
});

export function validateEnv() {
  if (process.env.SKIP_ENV_VALIDATION === "1") return;
  const envResult = envModel.safeParse(process.env);
  if (!envResult.success) {
    throw new Error(envResult.error.errors[0].message);
  }
  return;
}

export const env =
  process.env.SKIP_ENV_VALIDATION == "1"
    ? process.env
    : envModel.parse(process.env);
