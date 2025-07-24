import { Center, Stack } from "@mantine/core";
import Image from "next/image";

import { GoogleLoginButton } from "@/components/google/GoogleLoginButton";
import { PageInfo } from "@/components/PageInfo";
import SlackLoginButton from "@/components/slack/SlackLoginButton";
import { ensureNoActiveSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import invariant from "@/lib/invariant";
import { isSlackEnabled } from "@/lib/slack/slackApiConnection";

import BG from "./login-bg.png";

export default async function GoogleSignInPage(props: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const searchParams = await props.searchParams;

  await ensureNoActiveSession(searchParams.redirect);

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
            {searchParams?.error && searchParams.error !== "No session" && (
              <p className="text-danger">{searchParams.error}</p>
            )}
          </Stack>
        </Center>
        <Center>
          <Stack>
            <GoogleLoginButton />
            {isSlackEnabled && <SlackLoginButton />}
          </Stack>
        </Center>
      </div>
    </div>
  );
}
