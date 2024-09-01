import { exit } from "process";
import { z } from "zod";

const slackEnvType =
  process.env.SLACK_ENABLED == "true"
    ? z.string({
        required_error:
          "This variable must be set if the slack integration is enabled",
      })
    : z.string().optional();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string(),
  PUBLIC_URL: z
    .string()
    .refine((str) => !str.endsWith("/"), "PUBLIC_URL must not end with a '/'"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_PERMITTED_DOMAINS: z.string({
    description: "A comma separated list of domains to allow google login from",
  }),
  ADAMRMS_EMAIL: z.string().optional(),
  ADAMRMS_PASSWORD: z.string().optional(),
  ADAMRMS_BASE: z.string().optional(),
  ADAMRMS_PROJECT_TYPE_ID: z.string().optional(),
  SESSION_SECRET: z.string({
    required_error:
      "Try generating a random secret with `openssl rand -base64 32`",
  }),
  SLACK_ENABLED: z.enum(["true", "false"]).default("false"),
  SLACK_BOT_TOKEN: slackEnvType,
  SLACK_APP_TOKEN: slackEnvType,
  SLACK_SIGNING_SECRET: slackEnvType,
  SLACK_CLIENT_ID: slackEnvType,
  SLACK_CLIENT_SECRET: slackEnvType,
  SLACK_TEAM_ID: z.string().optional(),
  SLACK_CHECK_WITH_TECH_CHANNEL: z.string().default("#check-with-tech"),
  SLACK_TECH_HELP_CHANNEL: z.string().default("#check-with-tech"),
  COOKIE_DOMAIN: z.string().default(new URL(process.env.PUBLIC_URL ?? "").host),
  DEV_SSL: z.string().optional(), // Used to decide whether or not to use https in a dev environment
});

export function validateEnv(
  env?: any,
): NodeJS.ProcessEnv | z.infer<typeof envSchema> {
  if (process.env.SKIP_ENV_VALIDATION === "1") return process.env;
  const envResult = envSchema.safeParse(env ?? process.env);
  if (!envResult.success) {
    console.error("Error: Bad env configuration");
    for (const error of envResult.error.issues) {
      console.error(
        `   variable ${error.path.join(".")} ${error.code}, ${error.message}`,
      );
    }
    exit(1);
  }
  return envResult.data;
}

export const env = validateEnv();
