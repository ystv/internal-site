"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { Anchor, Breadcrumbs } from "@mantine/core";

const breadcrumbSegments: { [K: string]: string } = {
  calendar: "Calendar",
};

export default function YSTVBreadcrumbs() {
  const path = usePathname();
  const segments = useMemo(() => {
    if (path === "/") {
      return [];
    }
    const parts = path.split("/");
    const segments = [];
    // Skip the first (because it's empty) and the last (because it's the current page)
    for (const part of parts.slice(1, parts.length - 1)) {
      if (part in breadcrumbSegments) {
        segments.push({ name: breadcrumbSegments[part], path: `/${part}` });
      }
    }
    const result = [];
    for (const segment of segments) {
      result.push(
        <Anchor href={segment.path} component={Link} underline="hover">
          {segment.name}
        </Anchor>,
      );
    }
    return result;
  }, [path]);

  return (
    <Breadcrumbs>
      <Anchor href="/" component={Link} underline="hover">
        Home
      </Anchor>
      {segments}
    </Breadcrumbs>
  );
}
