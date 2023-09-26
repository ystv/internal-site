"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isNotLoggedIn, NotLoggedIn } from "@/lib/auth/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathName = usePathname();
  const router = useRouter();
  useEffect(() => {
    // If it's a sign-in error, redirect to sign in
    if (isNotLoggedIn(error)) {
      router.push("/login");
    }
    // Log the error to an error reporting service
    console.error(error);
  }, [error, pathName, router]);

  return (
    <html>
      <body>
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
      </body>
    </html>
  );
}
