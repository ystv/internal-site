import type { FormResponse } from "@/components/forms";
import { ActionIcon, Card, Group, Menu, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import type { Position } from "@prisma/client";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever, MdMoreHoriz } from "react-icons/md";
import type { z } from "zod";
import type { deletePositionSchema } from "./schema";

export function PositionCard(props: {
  position: Position;
  editAction: () => void;
  deleteAction: (
    data: z.infer<typeof deletePositionSchema>,
  ) => Promise<FormResponse>;
  onDeleteSuccess: () => void;
}) {
  return (
    <Card key={props.position.position_id} withBorder>
      <Group>
        <Text>{props.position.name}</Text>
        <Stack gap={0}>
          <Text size="sm">{props.position.brief_description}</Text>
          <Text size="xs" c={"dimmed"}>
            {props.position.full_description}
          </Text>
        </Stack>
        <Menu position="left">
          <Menu.Target>
            <ActionIcon ml={"auto"}>
              <MdMoreHoriz />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown miw={150} right={10} mr={10}>
            <Menu.Item onClick={props.editAction}>
              <Group>
                <FaEdit />
                Edit
              </Group>
            </Menu.Item>
            <Menu.Item
              aria-label="Delete position"
              color="red"
              onClick={() => {
                openDeleteModal({
                  onCancel: () => {},
                  onConfirm: async () => {
                    const deletedPosition = await props.deleteAction({
                      position_id: props.position.position_id,
                    });

                    if (!deletedPosition.ok) {
                      notifications.show({
                        message: "Unable to delete position",
                        color: "red",
                      });
                    } else {
                      props.onDeleteSuccess();
                      notifications.show({
                        message: `Successfully deleted "${props.position.name}"`,
                        color: "green",
                      });
                    }
                  },
                  positionName: props.position.name,
                });
              }}
            >
              <Group>
                <MdDeleteForever />
                Delete
              </Group>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

const openDeleteModal = (props: {
  onCancel: () => void;
  onConfirm: () => void;
  positionName: string;
}) =>
  modals.openConfirmModal({
    title: `Delete position "${props.positionName}"`,
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete the position &quot;{props.positionName}
        &quot;? This action is destructive and will remove all crew sheet roles
        this references.
      </Text>
    ),
    labels: { confirm: "Delete position", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onCancel: props.onCancel,
    onConfirm: props.onConfirm,
  });
