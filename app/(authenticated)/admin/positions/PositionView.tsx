"use client";

import { SearchBar } from "@/components/SearchBar";
import {
  CountControls,
  PageControls,
  PaginationProvider,
} from "@/components/navigation/Pagination";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { useValidSearchParams } from "@/lib/searchParams/validate";
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
import { Position } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { z } from "zod";
import { PositionCard } from "./PositionCard";
import {
  TFetchPositions,
  createPositionAction,
  deletePositionAction,
  fetchPositionsAction,
  updatePositionAction,
} from "./actions";
import { CreatePositionForm, UpdatePositionForm } from "./form";
import { searchParamsSchema } from "./schema";

export function PositionView(props: { initialPositions: TFetchPositions }) {
  const pathname = usePathname();
  const router = useRouter();

  // Get and force validate search params
  const rawSearchParams = useSearchParams();
  const validSearchParams = useValidSearchParams(
    searchParamsSchema,
    rawSearchParams,
  );

  const positionsQuery = useQuery({
    initialData: props.initialPositions,
    queryKey: ["admin:positions", validSearchParams],
    queryFn: async () => {
      const res = await fetchPositionsAction(validSearchParams);
      if (!res.ok) {
        throw new Error("An error occurred updating roles.");
      } else {
        return res;
      }
    },
  });

  const currentRange = useCurrentRange(positionsQuery.data);

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
  }, [searchParamsState]);

  // States for modals
  const [
    createModalOpened,
    { open: openCreateModal, close: closeCreateModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedPosition, setSelectedPosition] = useState<
    Position | undefined
  >();

  function updateState(state: Partial<z.infer<typeof searchParamsSchema>>) {
    setSearchParamsState({
      ...searchParamsState,
      ...state,
    });
  }

  if (positionsQuery.isError) {
    console.error(positionsQuery.error);
    return (
      <Text>An error occurred, check the browser console for details.</Text>
    );
  }

  if (!positionsQuery.isSuccess) {
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
          current: positionsQuery.data.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(positionsQuery.data.total / searchParamsState.count),
        }}
        totalItems={positionsQuery.data.total}
      >
        <Modal
          opened={createModalOpened}
          onClose={closeCreateModal}
          title={"Create Position"}
        >
          <CreatePositionForm
            action={createPositionAction}
            onSuccess={(): void => {
              positionsQuery.refetch();
              closeCreateModal();
            }}
          />
        </Modal>
        <Modal
          opened={editModalOpened}
          onClose={closeEditModal}
          title={"Edit Position"}
        >
          <UpdatePositionForm
            action={updatePositionAction}
            onSuccess={(): void => {
              positionsQuery.refetch();
              closeEditModal();
              setSelectedPosition(undefined);
            }}
            selectedPosition={selectedPosition}
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
          {positionsQuery.data.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {positionsQuery.data.positions.map((position) => {
            return (
              <PositionCard
                key={position.position_id}
                deleteAction={deletePositionAction}
                editAction={() => {
                  setSelectedPosition(position);
                  openEditModal();
                }}
                onDeleteSuccess={positionsQuery.refetch}
                position={position}
              />
            );
          })}
          {positionsQuery.data.total > 0 && (
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
  positionsData: TFetchPositions,
): `${number} - ${number}` {
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = positionsData.page * count;

  const start = (positionsData.page - 1) * count + 1;
  const end = positionsData.total < endIndex ? positionsData.total : endIndex;

  return `${start} - ${end}`;
}
