"use client";

import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import {
  MdAdd,
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";

import { type TCommitteeTeamForAdmin } from "@/features/committee";

import {
  addPositionToTeamAction,
  fetchCommitteeTeamForAdminAction,
  fetchPositionsNotInTeamAction,
  removePositionFromTeamAction,
  reorderPositionInTeamAction,
} from "./actions";

export function AdminCommitteeTeamView(props: {
  committeeTeam: TCommitteeTeamForAdmin;
}) {
  const committeeTeamQuery = useQuery({
    initialData: props.committeeTeam,
    queryKey: ["admin:committeeTeam", props.committeeTeam.committee_team_id],
    queryFn: async () => {
      const res = await fetchCommitteeTeamForAdminAction({
        committee_team_id: props.committeeTeam.committee_team_id,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch committee team");
      }
      return res.data;
    },
  });

  const [
    addPositionModalOpened,
    { open: openAddPositionModal, close: closeAddPositionModal },
  ] = useDisclosure(false);

  const committeeTeam = committeeTeamQuery.data;

  return (
    <>
      <Modal
        opened={addPositionModalOpened}
        onClose={closeAddPositionModal}
        title="Add Position to Team"
      >
        <AddPositionToTeamModal
          committeeTeamID={committeeTeam.committee_team_id}
          onChange={() => {
            committeeTeamQuery.refetch();
          }}
        />
      </Modal>
      <Stack>
        <Card withBorder>
          <Title order={3}>{committeeTeam.name}</Title>
          <Text>{committeeTeam.description}</Text>
        </Card>
        <Card withBorder>
          <Stack>
            <Group>
              <Title order={4}>Positions</Title>
              <Button
                leftSection={<MdAdd size={20} />}
                ml={"auto"}
                onClick={() => openAddPositionModal()}
              >
                Add
              </Button>
            </Group>
            {committeeTeam.position_teams.length === 0 ? (
              <Text>No positions in this team.</Text>
            ) : (
              <>
                {committeeTeam.position_teams.map((positionTeam) => (
                  <Card
                    key={positionTeam.committee_position_team_id}
                    withBorder
                  >
                    <Group>
                      <Stack gap={0}>
                        <Text>{positionTeam.committee_position.name}</Text>
                        <Text size="sm" c={"dimmed"}>
                          {positionTeam.committee_position.description}
                        </Text>
                        <Text size="xs" c={"dimmed"}>
                          {
                            positionTeam.committee_position._count
                              .committee_position_members
                          }{" "}
                          Member
                          {positionTeam.committee_position._count
                            .committee_position_members === 1
                            ? ""
                            : "s"}
                        </Text>
                      </Stack>
                      <Group ml={"auto"}>
                        <Stack gap={2}>
                          <Tooltip label="Move up">
                            <ActionIcon
                              disabled={positionTeam.ordering === 0}
                              onClick={async () => {
                                const res = await reorderPositionInTeamAction({
                                  committee_team_id:
                                    committeeTeam.committee_team_id,
                                  committee_position_id:
                                    positionTeam.committee_position
                                      .committee_position_id,
                                  direction: "up",
                                });
                                if (!res.ok) {
                                  notifications.show({
                                    message: "Failed to reorder position",
                                    color: "red",
                                  });
                                  return;
                                }
                                notifications.show({
                                  message: `Successfully moved "${positionTeam.committee_position.name}" up`,
                                  color: "green",
                                });
                                committeeTeamQuery.refetch();
                              }}
                            >
                              <MdKeyboardArrowUp />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Move down">
                            <ActionIcon
                              disabled={
                                positionTeam.ordering ===
                                committeeTeam.position_teams.length - 1
                              }
                              onClick={async () => {
                                const res = await reorderPositionInTeamAction({
                                  committee_team_id:
                                    committeeTeam.committee_team_id,
                                  committee_position_id:
                                    positionTeam.committee_position
                                      .committee_position_id,
                                  direction: "down",
                                });
                                if (!res.ok) {
                                  notifications.show({
                                    message: "Failed to reorder position",
                                    color: "red",
                                  });
                                  return;
                                }
                                notifications.show({
                                  message: `Successfully moved "${positionTeam.committee_position.name}" down`,
                                  color: "green",
                                });
                                committeeTeamQuery.refetch();
                              }}
                            >
                              <MdKeyboardArrowDown />
                            </ActionIcon>
                          </Tooltip>
                        </Stack>
                        <Tooltip label="Remove position from team">
                          <ActionIcon
                            ml={"auto"}
                            color="red"
                            onClick={() => {
                              openDeleteModal({
                                onCancel: () => {},
                                onConfirm: async () => {
                                  const res =
                                    await removePositionFromTeamAction({
                                      committee_team_id:
                                        committeeTeam.committee_team_id,
                                      committee_position_id:
                                        positionTeam.committee_position
                                          .committee_position_id,
                                    });
                                  if (!res.ok) {
                                    notifications.show({
                                      message:
                                        "Failed to remove position from team",
                                      color: "red",
                                    });
                                    return;
                                  }
                                  notifications.show({
                                    message: `Successfully removed "${positionTeam.committee_position.name}" from team`,
                                    color: "green",
                                  });
                                  committeeTeamQuery.refetch();
                                },
                                positionName:
                                  positionTeam.committee_position.name,
                              });
                            }}
                          >
                            <MdDelete />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </>
            )}
          </Stack>
        </Card>
      </Stack>
    </>
  );
}

export function AddPositionToTeamModal(props: {
  committeeTeamID: number;
  onChange: () => void;
}) {
  const positionsNotInTeamQuery = useQuery({
    queryKey: ["admin:committeePositions:notInTeam", props.committeeTeamID],
    queryFn: async () => {
      const res = await fetchPositionsNotInTeamAction({
        committee_team_id: props.committeeTeamID,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch positions not in team");
      }
      return res.data;
    },
  });

  if (!positionsNotInTeamQuery.data) {
    return <Loader />;
  }

  return (
    <Stack>
      {positionsNotInTeamQuery.data.length === 0 ? (
        <Text>All positions are already in this team.</Text>
      ) : (
        positionsNotInTeamQuery.data.map((position) => (
          <Card key={position.committee_position_id} withBorder>
            <Group>
              <Stack gap={0}>
                <Text>{position.name}</Text>
                <Text size="sm" c={"dimmed"}>
                  {position.description}
                </Text>
              </Stack>
              <Button
                ml={"auto"}
                onClick={async () => {
                  const res = await addPositionToTeamAction({
                    committee_team_id: props.committeeTeamID,
                    committee_position_id: position.committee_position_id,
                  });
                  if (!res.ok) {
                    throw new Error("Failed to add position to team");
                  }
                  props.onChange();
                  positionsNotInTeamQuery.refetch();
                }}
              >
                Add
              </Button>
            </Group>
          </Card>
        ))
      )}
    </Stack>
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
        Are you sure you want to remove the position &quot;{props.positionName}
        &quot; from this team?
      </Text>
    ),
    labels: { confirm: "Remove position", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onCancel: props.onCancel,
    onConfirm: props.onConfirm,
  });
