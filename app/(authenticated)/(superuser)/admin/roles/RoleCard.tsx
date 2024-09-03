import { RoleWithPermissions } from "@/features/people";
import {
  Card,
  Stack,
  Highlight,
  Group,
  ActionIcon,
  Tooltip,
  Text,
} from "@mantine/core";
import { FaEdit } from "react-icons/fa";
import { z } from "zod";
import { deleteRoleSchema } from "./schema";
import { FormResponse } from "@/components/Form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { MdDeleteForever } from "react-icons/md";

export function RoleCard(props: {
  role: RoleWithPermissions;
  searchQuery: string | undefined;
  editAction: () => void;
  deleteAction: (
    data: z.infer<typeof deleteRoleSchema>,
  ) => Promise<FormResponse>;
  onDeleteSuccess: () => void;
}) {
  const highlightValue = props.searchQuery?.split(" ") || [];
  return (
    <>
      <Card withBorder key={props.role.role_id}>
        <Group>
          <Stack gap={"xs"}>
            <Highlight highlight={highlightValue}>{props.role.name}</Highlight>
            {props.role.role_permissions.map((permission) => {
              return (
                <Highlight
                  highlight={highlightValue}
                  c={"dimmed"}
                  size="xs"
                  key={permission.permission}
                >
                  {permission.permission}
                </Highlight>
              );
            })}
          </Stack>
          <Tooltip label={"Edit Role"}>
            <ActionIcon onClick={props.editAction} ml={"auto"}>
              <FaEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={"Delete Role"}>
            <ActionIcon
              color="red"
              onClick={() => {
                openDeleteModal({
                  onCancel: () => {},
                  onConfirm: async () => {
                    const deletedRole = await props.deleteAction({
                      role_id: props.role.role_id,
                    });

                    if (!deletedRole.ok) {
                      notifications.show({
                        message: "Unable to delete role",
                        color: "red",
                      });
                    } else {
                      props.onDeleteSuccess();
                      notifications.show({
                        message: `Successfully deleted "${props.role.name}"`,
                        color: "green",
                      });
                    }
                  },
                  roleName: props.role.name,
                });
              }}
            >
              <MdDeleteForever />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Card>
    </>
  );
}

const openDeleteModal = (props: {
  onCancel: () => void;
  onConfirm: () => void;
  roleName: string;
}) =>
  modals.openConfirmModal({
    title: `Delete role "${props.roleName}"`,
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete the role &quot;{props.roleName}
        &quot;? This action is destructive and will remove this role from all
        users.
      </Text>
    ),
    labels: { confirm: "Delete role", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onCancel: props.onCancel,
    onConfirm: props.onConfirm,
  });
