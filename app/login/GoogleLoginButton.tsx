"use client";

import { usePublicURL } from "@/components/PublicURLContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

export function GoogleLoginButton(props: {
  clientID: string;
  hostedDomain: string | undefined;
  redirect?: string;
}) {
  const publicURL = usePublicURL();
  const gCsrfCookie = localStorage.getItem("g_csrf_token");
  const searchParams = useSearchParams();

  const loginRedirect = searchParams.get("redirect");

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" />

      {/* <div id="signInWrapper" className="my-8">
        <div
          id="g_id_onload"
          data-client_id={props.clientID}
          data-context="signin"
          data-ux_mode="redirect"
          data-login_uri={`${publicURL}/login/google/callback`}
          data-itp_support="true"
          data-prompt-parent="signInWrapper"
          data-hd="york.ac.uk"
        ></div>

        <div
          className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>
        <Script src="https://accounts.google.com/gsi/client" />
      </div> */}

      <Link
        href={`https://accounts.google.com/gsi/select?client_id=${
          props.clientID
        }&ux_mode=redirect&login_uri=${encodeURIComponent(
          publicURL +
            "/login/google/callback" +
              props.redirect
                ? "?redirect=" + props.redirect
                : loginRedirect
                ? "?redirect=" + loginRedirect
                : "",
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
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          style={{ height: 20, width: 20, marginRight: 12, display: "block" }}
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          ></path>
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          ></path>
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          ></path>
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          ></path>
          <path fill="none" d="M0 0h48v48H0z"></path>
        </svg>
        Sign in with Google
      </Link>
    </>
  );
}
