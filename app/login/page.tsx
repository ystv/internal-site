import Image from "next/image";
import BG from "./login-bg.png";
import { GoogleLoginButton } from "./GoogleLoginButton";
import invariant from "@/lib/invariant";

export default function GoogleSignInPage(props: {
  searchParams: { error?: string };
}) {
  invariant(process.env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID not set");
  return (
    <div className="relative block h-full w-full">
      <Image
        src={BG}
        alt=""
        priority
        className="fixed left-0 top-0 z-0 h-full w-full object-cover"
      />
      <div className="relative z-50 mx-auto mt-16 block max-w-lg rounded-lg bg-white p-16 shadow-lg">
        <h1 className="text-4xl font-bold text-black">Welcome to YSTV</h1>
        {props.searchParams?.error &&
          props.searchParams.error !== "No session" && (
            <p className="text-danger">{props.searchParams.error}</p>
          )}
        <GoogleLoginButton clientID={process.env.GOOGLE_CLIENT_ID!} />
      </div>
    </div>
  );
}
