import Script from "next/script";

export default function GoogleSignInPage() {
  return (
    <div>
      <div id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="redirect"
        data-login_uri={`${process.env.NEXT_PUBLIC_URL}/login/google/callback`}
        data-itp_support="true">
    </div>

    <div className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left">
    </div>
    <Script src="https://accounts.google.com/gsi/client" />
    </div>
  )
}