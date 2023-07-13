"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSignInURL } from "@/lib/auth/common-client";
import { isNotLoggedIn, NotLoggedIn } from "@/lib/auth/errors";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathName = usePathname();
  useEffect(() => {
    // If it's a sign-in error, redirect to sign in
    if (isNotLoggedIn(error)) {
      window.location.assign(getSignInURL(window.location.origin + pathName));
    }
    // Log the error to an error reporting service
    console.error(error);
  }, [error, pathName]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
