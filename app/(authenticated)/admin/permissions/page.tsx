import {requirePermission} from "@/lib/auth/server";
import {
    Card,
    Group,
    Space,
    Stack,
} from "@mantine/core";
import {getPermissions} from "@/features/permission";
import {PermissionRow} from "@/app/(authenticated)/admin/permissions/permissionRow";
import {AddPermissionView} from "@/app/(authenticated)/admin/permissions/AddPermissionForm";

export default async function PermissionsPage() {
    await requirePermission(
        "SuperUser"
    );
    let permissions= await getPermissions()

    return (
        <div>
            <Card withBorder>
                <Group>
                    <Stack gap={3}>
                        <h2 className="my-0">Permissions</h2>
                        <AddPermissionView/>
                    </Stack>
                </Group>
            </Card>
            <Space h={"md"} />
            <Card withBorder>
                <Stack gap={0}>
                    <table className="mt-4 border-collapse">
                        <thead
                            className={
                                "divide-x-0 divide-y-2 divide-dashed divide-gray-200 dark:divide-[--mantine-color-placeholder]"
                            }
                        >
                        <tr>
                            <th>Permission ID</th>
                            <th>Name</th>
                            <th>Description</th>
                        </tr>
                        </thead>
                        <tbody
                            className={
                                "divide-x-0 divide-y-2 divide-dashed divide-gray-200 dark:divide-[--mantine-color-placeholder]"
                            }
                        >
                        {permissions
                            .map((permission) => {
                                return (
                                    // eslint-disable-next-line react/jsx-key
                                    <PermissionRow
                                        permission={permission}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </Stack>
            </Card>
        </div>
    );
}
