"use client";

import {
  ActionIcon,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Role } from "@prisma/client";
import { use } from "react";
import { FaPlus } from "react-icons/fa";

export function GiveUserRoleForm(props: {
  onGiveRole: (role_id: number) => Promise<boolean>;
  roles: Promise<Role[]>;
}) {
  const roles = use(props.roles);

  const [isLoading, { open: setLoading, close: unsetLoading }] =
    useDisclosure(false);

  return (
    <>
      <Stack>
        <LoadingOverlay visible={isLoading} />
        {roles.map((role) => {
          return (
            <Card key={role.role_id}>
              <Group>
                <Stack>
                  <Text>{role.name}</Text>
                  {role.description && (
                    <Text c={"dimmed"} size="sm">
                      {role.description}
                    </Text>
                  )}
                </Stack>
                <ActionIcon
                  ml={"auto"}
                  onClick={async () => {
                    setLoading();
                    const response = await props.onGiveRole(role.role_id);
                    if (response == true) {
                      unsetLoading();
                      notifications.show({
                        color: "green",
                        message: `Successfully gave user ${role.name} role.`,
                      });
                    } else {
                      unsetLoading();
                      notifications.show({
                        color: "red",
                        message: `Unable to give user ${role.name} role. Please contact Computing Team`,
                      });
                    }
                  }}
                  disabled={isLoading}
                >
                  <FaPlus />
                </ActionIcon>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
