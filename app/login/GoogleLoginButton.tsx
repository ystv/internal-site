"use client";

import { usePublicURL } from "@/components/PublicURLContext";
import GoogleIcon from "@/components/icons/GoogleIcon";
import Link from "next/link";
import Script from "next/script";

export function GoogleLoginButton(props: {
  clientID: string;
  hostedDomain: string | undefined;
  gCsrfToken: string | undefined;
}) {
  "use client";
  const publicURL = usePublicURL();

  let gCsrfCookie = props.gCsrfToken || null;

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" />

      <Link
        href={`https://accounts.google.com/gsi/select?client_id=${
          props.clientID
        }&ux_mode=redirect&login_uri=${encodeURIComponent(
          publicURL + "/login/google/callback",
        )}&ui_mode=card&context=signin${
          props.hostedDomain ? `&hosted_domain=${props.hostedDomain}` : ""
        }&g_csrf_token=${gCsrfCookie}&origin=${encodeURIComponent(publicURL)}`}
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
        <GoogleIcon marginRight={12} />
        Sign in with Google
      </Link>
    </>
  );
}
