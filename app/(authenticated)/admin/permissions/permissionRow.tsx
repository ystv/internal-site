"use client";

import { useRouter } from "next/navigation";
import { PermissionType } from "@/features/permission";

export function PermissionRow({ permission }: { permission: string }) {
  const router = useRouter();

  return (
    <>
      <tr
        key={permission}
        className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
        style={{ height: "40px" }}
        // onClick={() =>
        //   router.push(`/admin/permissions/${permission.permission_id}`)
        // }
      >
        <td style={{ textAlign: "center" }}>{permission}</td>
        {/*<td style={{ textAlign: "center" }}>{permission.name}</td>*/}
        {/*<td style={{ textAlign: "center" }}>{permission.description}</td>*/}
      </tr>
    </>
  );
}
