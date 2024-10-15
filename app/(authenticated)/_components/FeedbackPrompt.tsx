"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeedbackPrompt() {
  const pathname = usePathname();

  return (
    <Link href={`/feedback?return_to=${encodeURIComponent(pathname)}`}>
      Got an idea or found something broken?
    </Link>
  );
}
