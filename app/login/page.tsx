import { GoogleLoginButton } from "@/components/google/GoogleLoginButton";
import SlackLoginButton from "@/components/slack/SlackLoginButton";
import { PageInfo } from "@/components/util/PageInfo";
import { ensureNoActiveSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import invariant from "@/lib/invariant";
import { isSlackEnabled } from "@/lib/slack/slackApiConnection";
import { Center, Stack } from "@mantine/core";
import Image from "next/image";
import BG from "./login-bg.png";

export default async function GoogleSignInPage(props: {
  searchParams: { error?: string; redirect?: string };
}) {
  await ensureNoActiveSession(props.searchParams.redirect);

  invariant(env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID not set");

  return (
    <div className="relative block h-full w-full">
      <PageInfo title="Login" />
      <Image
        src={BG}
        alt=""
        priority
        className="fixed left-0 top-0 z-0 h-full w-full object-cover"
      />
      <div className="relative z-50 mx-auto mt-16 block max-w-lg rounded-lg bg-white p-16 shadow-lg dark:bg-[--mantine-color-body]">
        <Center>
          <Stack>
            <h1 className="text-4xl font-bold text-black dark:text-white">
              Welcome to YSTV
            </h1>
            {props.searchParams?.error &&
              props.searchParams.error !== "No session" && (
                <p className="text-danger">{props.searchParams.error}</p>
              )}
          </Stack>
        </Center>
        <Center>
          <Stack>
            <GoogleLoginButton
              clientID={env.GOOGLE_CLIENT_ID!}
              hostedDomain={env.GOOGLE_PERMITTED_DOMAINS}
              gCsrfCookie={crypto.randomUUID()}
            />
            {isSlackEnabled && (
              <SlackLoginButton slackClientID={process.env.SLACK_CLIENT_ID!} />
            )}
          </Stack>
        </Center>
      </div>
    </div>
  );
}
