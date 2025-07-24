"use client";

import {
  Button,
  type ButtonProps,
  type MantineStyleProps,
} from "@mantine/core";
import { type PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import SlackIcon from "../icons/SlackIcon";
import { usePublicURL } from "../PublicURLContext";

export default function SlackLoginButton(props: {
  height?: number | string;
  mantineCompat?: boolean;
  redirect?: string;
  ml?: MantineStyleProps["ml"];
  variant?: PolymorphicComponentProps<"button", ButtonProps>["variant"];
}) {
  const publicURL = usePublicURL();
  const searchParams = useSearchParams();

  const loginRedirect = searchParams.get("redirect");

  const slackLoginLink = `${publicURL}/login/slack${
    props.redirect
      ? "?redirect=" + props.redirect
      : loginRedirect !== null
      ? "?redirect=" + loginRedirect
      : ""
  }`;

  return (
    <>
      {props.mantineCompat ? (
        <Button
          leftSection={<SlackIcon />}
          variant={props.variant || "light"}
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
