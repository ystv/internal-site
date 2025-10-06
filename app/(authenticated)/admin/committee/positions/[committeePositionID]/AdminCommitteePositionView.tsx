"use client";

import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { type CommitteePositionMember } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { FaMinus } from "react-icons/fa";

import Form from "@/components/Form";
import { DatePickerField, SearchedMemberSelect } from "@/components/FormFields";
import { getUserName } from "@/components/UserHelpers";
import { type TCommitteePositionForAdmin } from "@/features/committee";

import {
  fetchCommitteePositionForAdminAction,
  fetchPastUsersForCommitteePositionAction,
  promoteUserToCommitteePositionAction,
  stepDownUserFromCommitteePositionAction,
} from "./actions";
import {
  promoteUserToCommitteePositionSchema,
  stepDownUserFromCommitteePositionSchema,
} from "./schema";

export function AdminCommitteePositionView(props: {
  committeePosition: TCommitteePositionForAdmin;
}) {
  const committeePositionQuery = useQuery({
    initialData: props.committeePosition,
    queryKey: [
      "admin:committeePosition",
      props.committeePosition.committee_position_id,
    ],
    queryFn: async () => {
      const res = await fetchCommitteePositionForAdminAction({
        committee_position_id: props.committeePosition.committee_position_id,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch committee position");
      }
      return res.data;
    },
  });

  const previousMembersQuery = useQuery({
    queryKey: [
      "admin:committeePosition:previousMembers",
      props.committeePosition.committee_position_id,
    ],
    queryFn: async () => {
      const res = await fetchPastUsersForCommitteePositionAction({
        committee_position_id: props.committeePosition.committee_position_id,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch past users");
      }
      return res.data;
    },
  });

  const [
    promoteUserModalOpened,
    { open: openPromoteUserModal, close: closePromoteUserModal },
  ] = useDisclosure(false);
  const [
    stepDownUserModalOpened,
    { open: openStepDownUserModal, close: closeStepDownUserModal },
  ] = useDisclosure(false);
  const [selectedMember, setSelectedMember] = useState<
    | (CommitteePositionMember & {
        user: {
          first_name: string;
          nickname: string;
          last_name: string;
        };
      })
    | null
  >(null);

  const committeePosition = committeePositionQuery.data;

  return (
    <>
      <PromoteUserModal
        committeePosition={committeePosition}
        opened={promoteUserModalOpened}
        onClose={closePromoteUserModal}
        action={promoteUserToCommitteePositionAction}
        onSuccess={() => {
          committeePositionQuery.refetch();
          previousMembersQuery.refetch();
          closePromoteUserModal();
        }}
      />
      <StepDownUserModal
        committeePositionMember={selectedMember}
        positionName={committeePosition.name}
        opened={stepDownUserModalOpened}
        onClose={closeStepDownUserModal}
        action={stepDownUserFromCommitteePositionAction}
        onSuccess={() => {
          committeePositionQuery.refetch();
          previousMembersQuery.refetch();
          closeStepDownUserModal();
        }}
      />
      <Stack>
        <Card withBorder>
          <Title order={3}>{committeePosition.name}</Title>
          <Text>{committeePosition.description}</Text>
        </Card>
        <Card withBorder>
          <Stack>
            <Group>
              <Title order={4}>Current Members</Title>
              <Tooltip
                label={
                  committeePosition.committee_position_members.length <
                  committeePosition.seats
                    ? "Promote a user to this committee position"
                    : "All seats are currently filled"
                }
              >
                <Button
                  size="xs"
                  onClick={openPromoteUserModal}
                  disabled={
                    committeePositionQuery.isFetching ||
                    committeePosition.committee_position_members.length >=
                      committeePosition.seats
                  }
                  ml={"auto"}
                >
                  {committeePositionQuery.isFetching ? (
                    <Loader size="xs" />
                  ) : (
                    "Promote User"
                  )}
                </Button>
              </Tooltip>
            </Group>
            {committeePosition.committee_position_members.length === 0 ? (
              <Text>No current members</Text>
            ) : (
              <Stack>
                {committeePosition.committee_position_members.map((member) => (
                  <Card key={member.committee_position_member_id} withBorder>
                    <Group>
                      <Stack gap={2}>
                        <Text>
                          {getUserName(member.user)} ({member.user.email})
                        </Text>
                        <Text size="xs" c={"dimmed"}>
                          {dayjs(member.start_date).format("DD/MM/YYYY")} -{" "}
                          {member.end_date
                            ? dayjs(member.end_date).format("DD/MM/YYYY")
                            : "Present"}
                        </Text>
                      </Stack>
                      <Tooltip label="Step Down">
                        <ActionIcon
                          ml={"auto"}
                          color="red"
                          onClick={() => {
                            setSelectedMember(member);
                            openStepDownUserModal();
                          }}
                        >
                          <FaMinus />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
        <Card withBorder>
          <Stack>
            <Title order={4}>Past Members</Title>
            {previousMembersQuery.isLoading ? (
              <Center>
                <Loader />
              </Center>
            ) : previousMembersQuery.data &&
              previousMembersQuery.data.length === 0 ? (
              <Text>No past members</Text>
            ) : (
              <>
                {previousMembersQuery.data?.map((member) => (
                  <Card key={member.committee_position_member_id} withBorder>
                    <Group>
                      <Stack gap={2}>
                        <Text>
                          {getUserName(member.user)} ({member.user.email})
                        </Text>
                        <Text size="xs" c={"dimmed"}>
                          {dayjs(member.start_date).format("DD/MM/YYYY")} -{" "}
                          {member.end_date
                            ? dayjs(member.end_date).format("DD/MM/YYYY")
                            : "Present"}
                        </Text>
                      </Stack>
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

function PromoteUserModal(props: {
  committeePosition: TCommitteePositionForAdmin;
  opened: boolean;
  onClose: () => void;
  action: typeof promoteUserToCommitteePositionAction;
  onSuccess: () => void;
}) {
  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={`Promote User to ${props.committeePosition.name}`}
      size="lg"
    >
      <Form
        action={(data) => {
          if (!props.committeePosition) {
            throw new Error("No selected position");
          }
          return props.action({
            committee_position_id:
              props.committeePosition.committee_position_id,
            ...data,
          });
        }}
        onSuccess={(data) => {
          notifications.show({
            message: `Successfully promoted ${getUserName(
              data.member.user,
            )} "${props.committeePosition?.name}"`,
            color: "green",
          });
          props.onSuccess();
        }}
        schema={promoteUserToCommitteePositionSchema.omit({
          committee_position_id: true,
        })}
        initialValues={{
          start_date: new Date(),
        }}
        submitLabel="Promote User"
      >
        <SearchedMemberSelect name="user_id" label="User" />
        <DatePickerField name="start_date" label="Start Date" />
        <DatePickerField name="end_date" label="End Date" />
      </Form>
    </Modal>
  );
}

function StepDownUserModal(props: {
  committeePositionMember:
    | (CommitteePositionMember & {
        user: {
          first_name: string;
          nickname: string;
          last_name: string;
        };
      })
    | null;
  positionName: string;
  opened: boolean;
  onClose: () => void;
  action: typeof stepDownUserFromCommitteePositionAction;
  onSuccess: () => void;
}) {
  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={
        props.committeePositionMember
          ? `Step down ${getUserName(
              props.committeePositionMember.user,
            )} from ${props.positionName}`
          : "Error"
      }
      size="lg"
    >
      {props.committeePositionMember ? (
        <Form
          action={(data) => {
            return props.action({
              committee_position_member_id:
                props.committeePositionMember!.committee_position_member_id,
              ...data,
            });
          }}
          onSuccess={() => {
            notifications.show({
              message: `Successfully stepped down ${getUserName(
                props.committeePositionMember!.user,
              )} from "${props.positionName}"`,
              color: "green",
            });
            props.onSuccess();
          }}
          schema={stepDownUserFromCommitteePositionSchema.omit({
            committee_position_member_id: true,
          })}
          initialValues={{
            end_date: new Date(),
          }}
        >
          <DatePickerField name="end_date" label="End Date" />
        </Form>
      ) : (
        <>No user selected to step down</>
      )}
    </Modal>
  );
}
