"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePublicURL } from "../PublicURLContext";

export default function SlackLoginButton(props: {
  slackClientID: string;
  redirect?: string;
}) {
  const publicURL = usePublicURL();
  const searchParams = useSearchParams();

  const loginRedirect = searchParams.get("redirect");

  return (
    <Link
      href={`https://slack.com/openid/connect/authorize?scope=openid&response_type=code&client_id=${
        props.slackClientID
      }&redirect_uri=${encodeURIComponent(
        publicURL +
          "/login/slack/callback" +
          (props.redirect
            ? "?redirect=" + props.redirect
            : loginRedirect
            ? "?redirect=" + loginRedirect
            : ""),
      )}&scope=openid profile email`}
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
        height: 48,
        justifyContent: "center",
        textDecoration: "none",
        width: 256,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: 20, width: 20, marginRight: 12 }}
        viewBox="0 0 122.8 122.8"
      >
        <path
          d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
          fill="#e01e5a"
        />
        <path
          d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
          fill="#36c5f0"
        />
        <path
          d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
          fill="#2eb67d"
        />
        <path
          d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
          fill="#ecb22e"
        />
      </svg>
      Sign in with Slack
    </Link>
  );
}
