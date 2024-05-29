import Link from "next/link";
import SlackIcon from "../icons/SlackIcon";

export default async function SlackLoginButton() {
  return (
    <Link
      href={`https://slack.com/openid/connect/authorize?scope=openid&response_type=code&client_id=${
        process.env.SLACK_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        process.env.PUBLIC_URL! + "/login/slack/callback",
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
      <SlackIcon marginRight={12} />
      Sign in with Slack
    </Link>
  );
}
