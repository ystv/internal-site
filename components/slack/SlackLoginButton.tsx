"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePublicURL } from "../PublicURLContext";
import SlackIcon from "../icons/SlackIcon";
import { Button, MantineStyleProps } from "@mantine/core";

export default function SlackLoginButton(props: {
  slackClientID: string;
  height?: number | string;
  mantineCompat?: boolean;
  ml?: MantineStyleProps["ml"];
}) {
  const publicURL = usePublicURL();
  const searchParams = useSearchParams();

  const loginRedirect = searchParams.get("redirect");

  const slackLoginLink = `https://slack.com/openid/connect/authorize?scope=openid&response_type=code&client_id=${
    props.slackClientID
  }&redirect_uri=${encodeURIComponent(
    publicURL + "/login/slack/callback",
  )}&scope=openid profile email`;

  return (
    <>
      {props.mantineCompat ? (
        <Button
          leftSection={<SlackIcon />}
          variant="light"
          color="gray"
          component={Link}
          href={slackLoginLink}
          ml={props.ml}
        >
          Sign in with Slack
        </Button>
      ) : (
        <Link
          href={slackLoginLink}
          style={{
            alignItems: "center",
            color: "var(--mantine-color-text)",
            backgroundColor: "var(--mantine-color-default-hover)",
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: 4,
            display: "inline-flex",
            fontFamily: "Lato, sans-serif",
            fontSize: 16,
            fontWeight: 600,
            height: props.height ?? 48,
            justifyContent: "center",
            textDecoration: "none",
            width: 256,
          }}
        >
          <SlackIcon marginRight={12} />
          Sign in with Slack
        </Link>
      )}
    </>
  );
}
