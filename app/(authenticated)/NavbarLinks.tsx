"use client";

import { Permission, hasPermission } from "@/lib/auth/permissions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface NavLink {
  label: string;
  path: string;
  // This is OR, meaning any of these is sufficient
  requiredPermissions: Permission[];
}

const links: NavLink[] = [
  {
    label: "Calendar",
    path: "/calendar",
    requiredPermissions: ["MEMBER"],
  },
  {
    label: "Quotes",
    path: "/quotes",
    requiredPermissions: ["ManageQuotes"],
  },
];

export function NavbarLinks(props: { user: { permissions: Permission[] } }) {
  const pathName = usePathname();
  const visible = useMemo(
    () =>
      links.filter((link) =>
        hasPermission(props.user, ...link.requiredPermissions),
      ),
    [props.user],
  );
  if (visible.length < 2) {
    return null;
  }
  return (
    <div className="mx-2 my-0 flex h-full flex-row space-x-2">
      {visible.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={twMerge(
            "text-md flex items-center justify-center rounded-md px-2 py-1 text-white no-underline transition-transform",
            pathName === link.path
              ? "bg-blue-500/25 text-white"
              : "hover:scale-105",
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
