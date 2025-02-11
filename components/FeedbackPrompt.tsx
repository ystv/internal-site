"use client";

import { Anchor } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeedbackPrompt() {
  const pathname = usePathname();

  return (
    <Anchor href={`/feedback?return_to=${encodeURIComponent(pathname)}`}>
      Got an idea or found something broken?
    </Anchor>
  );
}
