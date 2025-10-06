import {
  ActionIcon,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { type CommitteePosition } from "@prisma/client";
import Link from "next/link";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDeleteForever, MdMoreHoriz } from "react-icons/md";
import { type z } from "zod";

import { type FormResponse } from "@/components/Form";

import { type deleteCommitteePositionSchema } from "./schema";

export function CommitteePositionCard(props: {
  committeePosition: CommitteePosition & {
    _count: { committee_position_members: number };
  };
  editAction: () => void;
  deleteAction: (
    data: z.infer<typeof deleteCommitteePositionSchema>,
  ) => Promise<FormResponse>;
  onDeleteSuccess: () => void;
}) {
  return (
    <Card key={props.committeePosition.committee_position_id} withBorder>
      <Group>
        <Text>{props.committeePosition.name}</Text>
        <Stack gap={0}>
          <Text size="sm">{props.committeePosition.description}</Text>
          <Text size="sm">{props.committeePosition.email}</Text>
          <Text size="xs" c={"dimmed"}>
            {props.committeePosition.seats} Seat
            {props.committeePosition.seats === 1 ? "" : "s"}
          </Text>
          <Text size="xs" c={"dimmed"}>
            {props.committeePosition._count.committee_position_members} Member
            {props.committeePosition._count.committee_position_members === 1
              ? ""
              : "s"}
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
                      committee_position_id:
                        props.committeePosition.committee_position_id,
                    });

                    if (!deletedPosition.ok) {
                      notifications.show({
                        message: "Unable to delete position",
                        color: "red",
                      });
                    } else {
                      props.onDeleteSuccess();
                      notifications.show({
                        message: `Successfully deleted "${props.committeePosition.name}"`,
                        color: "green",
                      });
                    }
                  },
                  positionName: props.committeePosition.name,
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
        <Link
          href={`/admin/committee/positions/${props.committeePosition.committee_position_id}`}
        >
          <Tooltip label="View Committee Position">
            <ActionIcon variant="light">
              <FaEye />
            </ActionIcon>
          </Tooltip>
        </Link>
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
        Are you sure you want to delete the committee position &quot;
        {props.positionName}
        &quot;? This action is destructive.
      </Text>
    ),
    labels: { confirm: "Delete committee position", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onCancel: props.onCancel,
    onConfirm: props.onConfirm,
  });
