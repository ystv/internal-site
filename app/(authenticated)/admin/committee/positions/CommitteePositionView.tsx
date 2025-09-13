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
import { type CommitteePosition } from "@prisma/client";
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
  createCommitteePositionAction,
  deleteCommitteePositionAction,
  fetchCommitteePositionsAction,
  type TFetchCommitteePositions,
  updateCommitteePositionAction,
} from "./actions";
import { CommitteePositionCard } from "./CommitteePositionCard";
import {
  CreateCommitteePositionForm,
  UpdateCommitteePositionForm,
} from "./form";
import { searchParamsSchema } from "./schema";

export function CommitteePositionView(props: {
  initialCommitteePositions: TFetchCommitteePositions;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Get and force validate search params
  const rawSearchParams = useSearchParams();
  const validSearchParams = useValidSearchParams(
    searchParamsSchema,
    rawSearchParams,
  );

  const committeePositionsQuery = useQuery({
    initialData: props.initialCommitteePositions,
    queryKey: ["admin:committeePositions", validSearchParams],
    queryFn: async () => {
      const res = await fetchCommitteePositionsAction(validSearchParams);
      if (!res.ok) {
        throw new Error("An error occurred updating committee positions.");
      } else {
        return res;
      }
    },
  });

  const currentRange = useCurrentRange(committeePositionsQuery.data);

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
  const [selectedCommitteePosition, setSelectedCommitteePosition] = useState<
    CommitteePosition | undefined
  >();

  function updateState(state: Partial<z.infer<typeof searchParamsSchema>>) {
    setSearchParamsState({
      ...searchParamsState,
      ...state,
    });
  }

  if (committeePositionsQuery.isError) {
    console.error(committeePositionsQuery.error);
    return (
      <Text>An error occurred, check the browser console for details.</Text>
    );
  }

  if (!committeePositionsQuery.isSuccess) {
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
          current: committeePositionsQuery.data.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(
            committeePositionsQuery.data.total / searchParamsState.count,
          ),
        }}
        totalItems={committeePositionsQuery.data.total}
      >
        <Modal
          opened={createModalOpened}
          onClose={closeCreateModal}
          title={"Create Position"}
        >
          <CreateCommitteePositionForm
            action={createCommitteePositionAction}
            onSuccess={(): void => {
              committeePositionsQuery.refetch();
              closeCreateModal();
            }}
          />
        </Modal>
        <Modal
          opened={editModalOpened}
          onClose={closeEditModal}
          title={"Edit Position"}
        >
          <UpdateCommitteePositionForm
            action={updateCommitteePositionAction}
            onSuccess={(): void => {
              committeePositionsQuery.refetch();
              closeEditModal();
              setSelectedCommitteePosition(undefined);
            }}
            selectedCommitteePosition={selectedCommitteePosition}
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
          {committeePositionsQuery.data.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {committeePositionsQuery.data.data.map((committeePosition) => {
            return (
              <CommitteePositionCard
                key={committeePosition.committee_position_id}
                deleteAction={deleteCommitteePositionAction}
                editAction={() => {
                  setSelectedCommitteePosition(committeePosition);
                  openEditModal();
                }}
                onDeleteSuccess={committeePositionsQuery.refetch}
                committeePosition={committeePosition}
              />
            );
          })}
          {committeePositionsQuery.data.total > 0 && (
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
  committeePositionsData: TFetchCommitteePositions,
): `${number} - ${number}` {
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = committeePositionsData.page * count;

  const start = (committeePositionsData.page - 1) * count + 1;
  const end =
    committeePositionsData.total < endIndex
      ? committeePositionsData.total
      : endIndex;

  return `${start} - ${end}`;
}
