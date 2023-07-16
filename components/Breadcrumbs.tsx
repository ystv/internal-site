"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";

const breadcrumbSegments: { [K: string]: string } = {
  calendar: "Calendar",
};

export default function Breadcrumbs() {
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
    const result = [
      <li key="/">
        <Link href="/" className="text-gray-700 hover:text-blue-700">
          Home
        </Link>
      </li>,
    ];
    for (const segment of segments) {
      result.push(
        <li key={"before-" + segment.path}>
          <IoChevronForward />
        </li>,
      );
      result.push(
        <li key={segment.path}>
          <Link
            href={segment.path}
            className="text-gray-700 hover:text-blue-700"
          >
            {segment.name}
          </Link>
        </li>,
      );
    }
    return result;
  }, [path]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav className="mx-2 my-2 flex items-center text-sm">
      <ol className="flex items-center space-x-4">{segments}</ol>
    </nav>
  );
}
