"use client";
import { Anchor, Breadcrumbs, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const breadcrumbSegments: { [K: string]: string } = {
  calendar: "Calendar",
  admin: "Admin",
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
        <Anchor
          href={segment.path}
          component={Link}
          underline="hover"
          key={`BC${result.length}`}
          c="white"
        >
          <Text c="white">{segment.name}</Text>
        </Anchor>,
      );
    }
    return result;
  }, [path]);

  return (
    <Breadcrumbs>
      <Anchor href="/" component={Link} underline="hover" key="BC0" c="white">
        {/*Home */}
        {/*<LuHome aria-label="Home" color="white" size={20} />*/}
        {/* Two Options for a Home Page Link when we add a Home Page */}
      </Anchor>
      {segments}
    </Breadcrumbs>
  );
}
