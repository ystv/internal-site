"use client";

import {
  Button,
  Center,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type CommitteeTeam } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { type z } from "zod";

import {
  CountControls,
  PageControls,
  PaginationProvider,
} from "@/components/navigation/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { useValidSearchParams } from "@/lib/searchParams/validateHook";

import {
  createCommitteeTeamAction,
  deleteCommitteeTeamAction,
  fetchCommitteeTeamsAction,
  type TFetchCommitteeTeams,
  updateCommitteeTeamAction,
} from "./actions";
import { CommitteeTeamCard } from "./CommitteeTeamCard";
import { CreateCommitteeTeamForm, UpdateCommitteeTeamForm } from "./form";
// import { PositionCard } from "./PositionCard";
import { searchParamsSchema } from "./schema";

export function CommitteeTeamView(props: {
  initialCommitteeTeams: TFetchCommitteeTeams;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Get and force validate search params
  const rawSearchParams = useSearchParams();
  const validSearchParams = useValidSearchParams(
    searchParamsSchema,
    rawSearchParams,
  );

  const committeeTeamsQuery = useQuery({
    initialData: props.initialCommitteeTeams,
    queryKey: ["admin:committeeTeams", validSearchParams],
    queryFn: async () => {
      const res = await fetchCommitteeTeamsAction(validSearchParams);
      if (!res.ok) {
        throw new Error("An error occurred updating committee positions.");
      } else {
        return res;
      }
    },
  });

  const currentRange = useCurrentRange(committeeTeamsQuery.data);

  const [searchParamsState, setSearchParamsState] = useState(validSearchParams);

  // Push search params changes to router on state change
  useEffect(() => {
    const newSearchParamsString = getSearchParamsString(searchParamsState);
    if (
      getSearchParamsString(Object.fromEntries(rawSearchParams.entries())) !=
      newSearchParamsString
    ) {
      router.push(`${pathname}?${newSearchParamsString}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsState]);

  // States for modals
  const [
    createModalOpened,
    { open: openCreateModal, close: closeCreateModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedCommitteeTeam, setSelectedCommitteeTeam] = useState<
    CommitteeTeam | undefined
  >();

  function updateState(state: Partial<z.infer<typeof searchParamsSchema>>) {
    setSearchParamsState({
      ...searchParamsState,
      ...state,
    });
  }

  if (committeeTeamsQuery.isError) {
    console.error(committeeTeamsQuery.error);
    return (
      <Text>An error occurred, check the browser console for details.</Text>
    );
  }

  if (!committeeTeamsQuery.isSuccess) {
    return <LoadingOverlay />;
  }

  // Wrapped in ScrollArea to avoid jerky scrolling on page change
  return (
    <ScrollArea>
      <PaginationProvider
        count={{
          current: searchParamsState.count,
          set(count) {
            updateState({ count });
          },
          values: ["10", "25", "50", "100"],
          range: currentRange,
        }}
        page={{
          current: committeeTeamsQuery.data.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(
            committeeTeamsQuery.data.total / searchParamsState.count,
          ),
        }}
        totalItems={committeeTeamsQuery.data.total}
      >
        <Modal
          opened={createModalOpened}
          onClose={closeCreateModal}
          title={"Create Position"}
        >
          <CreateCommitteeTeamForm
            action={createCommitteeTeamAction}
            onSuccess={(): void => {
              committeeTeamsQuery.refetch();
              closeCreateModal();
            }}
          />
        </Modal>
        <Modal
          opened={editModalOpened}
          onClose={closeEditModal}
          title={"Edit Position"}
        >
          <UpdateCommitteeTeamForm
            action={updateCommitteeTeamAction}
            onSuccess={(): void => {
              committeeTeamsQuery.refetch();
              closeEditModal();
              setSelectedCommitteeTeam(undefined);
            }}
            selectedCommitteeTeam={selectedCommitteeTeam}
          />
        </Modal>
        <Stack>
          <SearchBar
            default={validSearchParams.query}
            onChange={(query) => {
              updateState({
                query: query !== "" ? query : undefined,
              });
            }}
            label="Search by Name"
            withClear
          />
          <Group>
            <Button leftSection={<FaPlus />} onClick={openCreateModal}>
              Create Position
            </Button>
          </Group>
          {committeeTeamsQuery.data.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {committeeTeamsQuery.data.data.map((committeeTeam) => {
            return (
              <CommitteeTeamCard
                key={committeeTeam.committee_team_id}
                deleteAction={deleteCommitteeTeamAction}
                editAction={() => {
                  setSelectedCommitteeTeam(committeeTeam);
                  openEditModal();
                }}
                onDeleteSuccess={committeeTeamsQuery.refetch}
                committeeTeam={committeeTeam}
              />
            );
          })}
          {committeeTeamsQuery.data.total > 0 && (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          )}
        </Stack>
      </PaginationProvider>
    </ScrollArea>
  );
}

/**
 * @returns A string in the format `[start] - [end]` representing the range of currently displayed items
 */
function useCurrentRange(
  committeeTeamsData: TFetchCommitteeTeams,
): `${number} - ${number}` {
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = committeeTeamsData.page * count;

  const start = (committeeTeamsData.page - 1) * count + 1;
  const end =
    committeeTeamsData.total < endIndex ? committeeTeamsData.total : endIndex;

  return `${start} - ${end}`;
}
