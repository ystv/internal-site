import Image from "next/image";
import BG from "./login-bg.png";
import { GoogleLoginButton } from "./GoogleLoginButton";
import invariant from "@/lib/invariant";
import SlackLoginButton from "@/components/slack/SlackLoginButton";
import { isSlackEnabled } from "@/lib/slack/slackApiConnection";
import { Center, Stack } from "@mantine/core";

export default function GoogleSignInPage(props: {
  searchParams: { error?: string };
}) {
  invariant(process.env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID not set");

  const gCsrfCookie = crypto.randomUUID();

  return (
    <div className="relative block h-full w-full">
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
              clientID={process.env.GOOGLE_CLIENT_ID!}
              hostedDomain={process.env.GOOGLE_PERMITTED_DOMAINS}
              gCsrfToken={gCsrfCookie}
            />
            {isSlackEnabled && <SlackLoginButton />}
          </Stack>
        </Center>
      </div>
    </div>
  );
}
