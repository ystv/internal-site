"use client";

import { usePublicURL } from "@/components/PublicURLContext";
import Script from "next/script";

export function GoogleLoginButton(props: { clientID: string }) {
  const publicURL = usePublicURL();
  return (
    <div id="signInWrapper" className="my-8">
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
    </div>
  );
}
