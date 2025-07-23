"use client";

import {
  ActionIcon,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { type Role } from "@prisma/client";
import { use } from "react";
import { FaPlus } from "react-icons/fa";

import { type FormResponse } from "@/components/Form";

export function GiveUserRoleForm(props: {
  onGiveRole: (role_id: number) => Promise<FormResponse>;
  roles: Promise<Role[]>;
}) {
  const roles = use(props.roles);

  const [isLoading, { open: setLoading, close: unsetLoading }] =
    useDisclosure(false);

  return (
    <>
      <Stack>
        <LoadingOverlay visible={isLoading} />
        {roles.length != 0 ? (
          roles.map((role) => {
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
                      if (response.ok) {
                        unsetLoading();
                        notifications.show({
                          color: "green",
                          message: `Successfully gave user ${role.name} role.`,
                        });
                      } else {
                        unsetLoading();
                        notifications.show({
                          color: "red",
                          message: `Unable to give user ${role.name} role: ${response.errors}`,
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
          })
        ) : (
          <Stack>
            <Text size={"xl"} fw={600}>
              No more roles available
            </Text>
            <Text size={"sm"} c={"dimmed"}>
              They caught &apos;em all
            </Text>
          </Stack>
        )}
      </Stack>
    </>
  );
}
