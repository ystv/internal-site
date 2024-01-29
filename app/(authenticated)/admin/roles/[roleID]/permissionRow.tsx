"use client";

import { useRouter } from "next/navigation";

// import {PermissionType} from "@/features/permission";

export function PermissionRow(
  {
    permission,
  }: {
    permission: string;
  },
  { key }: { key: string },
) {
  const router = useRouter();

  return (
    <>
      <li
        key={key}
        className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
        style={{ height: "40px" }}
        onClick={() => router.push(`/admin/permissions/${permission}`)}
      >
        {permission}
      </li>
    </>
  );
}
