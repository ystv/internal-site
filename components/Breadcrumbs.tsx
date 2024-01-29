"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { Anchor, Breadcrumbs } from "@mantine/core";

const breadcrumbSegments: { [K: string]: string } = {
  admin: "Admin",
  calendar: "Calendar",
  permissions: "Permissions",
  roles: "Roles",
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
    let parts1 = parts.slice(1, parts.length - 1);
    for (let i = 0; i < parts1.length; i++) {
      let part = parts1[i];
      if (part in breadcrumbSegments) {
        // Building the path backwards so the complete path will exist
        let tempPath: string = "";
        for (let j = i; j >= 0; j--) {
          tempPath = `/${parts1[j]}` + tempPath;
        }
        segments.push({ name: breadcrumbSegments[part], path: tempPath });
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
        >
          {segment.name}
        </Anchor>,
      );
    }
    return result;
  }, [path]);

  return (
    <Breadcrumbs>
      <Anchor href="/" component={Link} underline="hover" key="BC0">
        Home
      </Anchor>
      {segments}
    </Breadcrumbs>
  );
}
