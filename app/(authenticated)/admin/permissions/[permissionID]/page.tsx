import { notFound } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { getPermission } from "@/features/permission";
import { Card, Group, Stack } from "@mantine/core";
import { PermissionViews } from "@/app/(authenticated)/admin/permissions/[permissionID]/EditDeletePermissionForms";

export default async function PermissionPage({
  params,
}: {
  params: { permissionID: string };
}) {
  // const permission = await getPermission(parseInt(params.permissionID, 10));
  // if (!permission) {
  notFound();
  // }
  // return (
  //   <div>
  //     <Card withBorder>
  //       <Group>
  //         <Stack gap={3}>
  //           <h1 className={twMerge("text-4xl font-bold")}>{permission.name}</h1>
  //           <PermissionViews permission={permission} />
  //           Permission ID: {permission.permission_id}
  //           <br />
  //           Name: {permission.name}
  //           <br />
  //           Description: {permission.description}
  //         </Stack>
  //       </Group>
  //     </Card>
  //   </div>
  // );
}
