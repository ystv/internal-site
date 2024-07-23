"use client";

import { LoadingOverlay } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginPrompt() {
  const router = useRouter();
  const pathname = usePathname();

  function doLoginRedirect() {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  useEffect(() => {
    doLoginRedirect();
  }, []);

  setTimeout(doLoginRedirect, 3000);

  return (
    <div className="fixed left-0 right-0 top-0 h-screen w-screen">
      <LoadingOverlay visible />
    </div>
  );
}
