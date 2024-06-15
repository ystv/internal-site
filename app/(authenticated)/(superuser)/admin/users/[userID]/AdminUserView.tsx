"use client";

import { FormResponse } from "@/components/Form";
import { getUserName } from "@/components/UserHelpers";
import { UserWithIdentitiesRoles, giveUserRoleSchema } from "@/features/people";
import {
  Stack,
  Card,
  Group,
  Avatar,
  Space,
  Text,
  Modal,
  Button,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Role } from "@prisma/client";
import { Suspense } from "react";
import { z } from "zod";
import { GiveUserRoleForm } from "./GiveUserRoleForm";
import { property } from "lodash";
import { useRouter } from "next/navigation";
import { FaEdit, FaMinus } from "react-icons/fa";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { editUserSchema } from "./schema";
import { EditUserForm } from "./EditUserForm";

export function AdminUserView(props: {
  user: UserWithIdentitiesRoles;
  giveUserRole: (
    data: z.infer<typeof giveUserRoleSchema>,
  ) => Promise<FormResponse>;
  removeUserRole: (
    data: z.infer<typeof giveUserRoleSchema>,
  ) => Promise<FormResponse>;
  editUserAction: (
    data: z.infer<typeof editUserSchema>,
  ) => Promise<FormResponse>;
  userAbsentRoles: Promise<Role[]>;
}) {
  const [
    addRoleModalOpened,
    { open: openAddRoleModal, close: closeAddRoleModal },
  ] = useDisclosure(false);

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  const router = useRouter();

  return (
    <>
      <Modal opened={addRoleModalOpened} onClose={closeAddRoleModal}>
        <Suspense>
          <GiveUserRoleForm
            roles={props.userAbsentRoles}
            onGiveRole={async (role_id) => {
              const response = await props.giveUserRole({
                user_id: props.user.user_id,
                role_id: role_id,
              });
              if (response.ok) {
                closeAddRoleModal();
                router.refresh();
                return true;
              } else {
                return false;
              }
            }}
          />
        </Suspense>
      </Modal>
      <Modal opened={editModalOpened} onClose={closeEditModal}>
        <EditUserForm
          action={props.editUserAction}
          user={props.user}
          onSuccess={() => {
            closeEditModal();
            notifications.show({
              color: "green",
              message: `Successfully updated user!`,
            });
            router.refresh();
          }}
        />
      </Modal>
      <Stack>
        <Card withBorder>
          <Group>
            <Avatar src={props.user.avatar} size={"lg"} />
            <Stack gap={3}>
              <Text>{getUserName(props.user)}</Text>
              <Text c={"dimmed"} size="sm">
                {props.user.email}
              </Text>
            </Stack>
            <Tooltip label={"Edit User Info"}>
              <ActionIcon onClick={openEditModal} ml={"auto"}>
                <FaEdit />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Card>
        <Card withBorder>
          {props.user.roles.length > 0 ? (
            <>
              <Group>
                <Text size="lg">User Roles:</Text>
                <Button onClick={openAddRoleModal} ml={"auto"}>
                  Add Role
                </Button>
              </Group>
              <Space variant="horizontal" h={"md"} />
              <Stack>
                {props.user.roles.map((role) => {
                  return (
                    <Card key={role.role_id}>
                      <Group>
                        <Stack gap={0}>
                          <Text>{role.name}</Text>
                          {role.role_permissions.map((permission) => {
                            return (
                              <Text
                                c={"dimmed"}
                                size="sm"
                                key={permission.permission}
                              >
                                {permission.permission}
                              </Text>
                            );
                          })}
                        </Stack>
                        <ActionIcon
                          color="red"
                          ml={"auto"}
                          onClick={() => {
                            confirmRoleDelete({
                              role,
                              onConfirm: async () => {
                                const response = await props.removeUserRole({
                                  user_id: props.user.user_id,
                                  role_id: role.role_id,
                                });

                                if (response.ok) {
                                  notifications.show({
                                    color: "green",
                                    message: `Successfully removed user from ${role.name} role.`,
                                  });
                                  router.refresh();
                                } else {
                                  notifications.show({
                                    color: "red",
                                    message: `Failed to remove user from ${role.name} role.`,
                                  });
                                }
                              },
                              onCancel() {},
                            });
                          }}
                        >
                          <FaMinus />
                        </ActionIcon>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </>
          ) : (
            <>
              <Group>
                <Text size="md">This user has no roles.</Text>
                <Button onClick={openAddRoleModal} ml={"auto"}>
                  Add Role
                </Button>
              </Group>
            </>
          )}
        </Card>
      </Stack>
    </>
  );
}

function confirmRoleDelete({
  role,
  onConfirm,
  onCancel,
}: {
  role: Role;
  onConfirm: () => void;
  onCancel: () => void;
}): void {
  modals.openConfirmModal({
    title: "Remove role from user?",
    children: <Text>This will remove the role &quot;{role.name}&quot;</Text>,
    labels: { confirm: "Confirm", cancel: "Cancel" },
    onCancel,
    onConfirm,
    confirmProps: { color: "red" },
  });
}
