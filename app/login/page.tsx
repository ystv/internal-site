import Script from "next/script";
import Image from "next/image";
import BG from "./login-bg.png";

export default function GoogleSignInPage() {
  return (
    <div className="relative block h-full w-full">
      <Image
        src={BG}
        alt=""
        priority
        className="fixed left-0 top-0 z-0 h-full w-full object-cover"
      />
      <div className="z-50 mt-16 block rounded-lg bg-white p-16 shadow-lg" id="signInWrapper">
        <h1 className="text-black">Welcome to YSTV</h1>
        <div
          id="g_id_onload"
          data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
          data-context="signin"
          data-ux_mode="redirect"
          data-login_uri={`${process.env.NEXT_PUBLIC_URL}/login/google/callback`}
          data-itp_support="true"
          data-prompt-parent="signInWrapper"
          data-hd="*"
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
      </div>
      <Script src="https://accounts.google.com/gsi/client" />
    </div>
  );
}
