"use client";

import { useRouter } from "next/navigation";
import { RoleType } from "@/features/role/roles";

export function RoleRow({ role }: { role: RoleType }) {
  const router = useRouter();

  return (
    <>
      <tr
        key={role.role_id}
        className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
        onClick={() => router.push(`/admin/roles/${role.role_id}`)}
      >
        <td style={{ textAlign: "center" }}>{role.role_id}</td>
        <td style={{ textAlign: "center" }}>{role.name}</td>
        <td style={{ textAlign: "center" }}>{role.description}</td>
      </tr>
    </>
  );
}
