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
import { type CommitteeTeam } from "@prisma/client";
import Link from "next/link";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDeleteForever, MdMoreHoriz } from "react-icons/md";
import { type z } from "zod";

import { type FormResponse } from "@/components/Form";

import { type deleteCommitteeTeamSchema } from "./schema";

export function CommitteeTeamCard(props: {
  committeeTeam: CommitteeTeam & {
    _count: { position_teams: number };
  };
  editAction: () => void;
  deleteAction: (
    data: z.infer<typeof deleteCommitteeTeamSchema>,
  ) => Promise<FormResponse>;
  onDeleteSuccess: () => void;
}) {
  return (
    <Card key={props.committeeTeam.committee_team_id} withBorder>
      <Group>
        <Text>{props.committeeTeam.name}</Text>
        <Stack gap={0}>
          <Text size="sm">{props.committeeTeam.description}</Text>
          <Text size="xs" c={"dimmed"}>
            {props.committeeTeam._count.position_teams} Position
            {props.committeeTeam._count.position_teams === 1 ? "" : "s"}
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
                      committee_team_id: props.committeeTeam.committee_team_id,
                    });

                    if (!deletedPosition.ok) {
                      notifications.show({
                        message: "Unable to delete position",
                        color: "red",
                      });
                    } else {
                      props.onDeleteSuccess();
                      notifications.show({
                        message: `Successfully deleted "${props.committeeTeam.name}"`,
                        color: "green",
                      });
                    }
                  },
                  positionName: props.committeeTeam.name,
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
          href={`/admin/committee/teams/${props.committeeTeam.committee_team_id}`}
        >
          <Tooltip label="View Committee Team">
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
