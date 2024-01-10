"use client";

import {useRouter} from "next/navigation";
import {PermissionType} from "@/features/permission";

export function PermissionRow({permission}: { permission: PermissionType }) {
    const router = useRouter();

    return (
        <>
            <tr
                key={permission.permission_id}
                className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
                onClick={() => router.push(`/admin/permissions/${permission.permission_id}`)}
            >
                <td style={{"textAlign": "center"}}>
                    {permission.permission_id}
                </td>
                <td style={{"textAlign": "center"}}>
                    {permission.name}
                </td>
                <td style={{"textAlign": "center"}}>
                    {permission.description}
                </td>
            </tr>
        </>
    );
}
