"use client";

import { isNotLoggedIn } from "@/lib/auth/errors";
import * as Sentry from "@sentry/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest: number };
  reset: () => void;
}) {
  const pathName = usePathname();
  const router = useRouter();
  useEffect(() => {
    // If it's a sign-in error, redirect to sign in
    if (isNotLoggedIn(error)) {
      router.push("/login?error=" + encodeURIComponent(error.message));
    }
    // Log the error to an error reporting service
    Sentry.captureException(error, {
      tags: {
        pathName,
      },
    });
    console.error(error);
  }, [error, pathName, router]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <div>
        <pre>{String(error)}</pre>
      </div>
      <div>Digest: {error.digest ?? "none"}</div>
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
