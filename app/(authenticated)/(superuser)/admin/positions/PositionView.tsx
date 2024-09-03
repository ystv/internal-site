"use client";

import { FormResponse } from "@/components/Form";
import { usePositions } from "@/components/PositionsContext";
import {
  Button,
  Center,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { Position } from "@prisma/client";
import { usePathname, useSearchParams } from "next/navigation";
import {
  searchParamsSchema,
  createPositionSchema,
  deletePositionSchema,
  updatePositionSchema,
} from "./schema";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  CountControls,
  PageControls,
  PaginationProvider,
} from "@/components/Pagination";
import { useDisclosure } from "@mantine/hooks";
import { SearchBar } from "@/components/SearchBar";
import { CreatePositionForm, UpdatePositionForm } from "./form";
import { useValidSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { PositionCard } from "./PositionCard";

export function PositionView(props: {
  createPosition: (
    data: z.infer<typeof createPositionSchema>,
  ) => Promise<FormResponse>;
  updatePosition: (
    data: z.infer<typeof updatePositionSchema>,
  ) => Promise<FormResponse>;
  deletePosition: (
    data: z.infer<typeof deletePositionSchema>,
  ) => Promise<FormResponse>;
  fetchPositions: (
    data: z.infer<typeof searchParamsSchema>,
  ) => Promise<
    FormResponse<{ positions: Position[]; page: number; total: number }>
  >;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const positionsContext = usePositions();

  // Get and force validate search params
  const rawSearchParams = useSearchParams();
  const validSearchParams = useValidSearchParams(
    searchParamsSchema,
    rawSearchParams,
  );

  const currentRange = useCurrentRange();

  const [searchParamsState, setSearchParamsState] = useState(validSearchParams);

  // Push search params changes to router on state change
  useEffect(() => {
    const newSearchParamsString = getSearchParamsString(searchParamsState);
    if (
      getSearchParamsString(Object.fromEntries(rawSearchParams.entries())) !=
      newSearchParamsString
    ) {
      router.push(`${pathname}?${newSearchParamsString}`);
      updatePositions();
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

  async function updatePositions() {
    const updatedPositions = await props.fetchPositions(searchParamsState);

    if (updatedPositions.ok) {
      positionsContext.updateContext(
        updatedPositions.positions,
        updatedPositions.page,
        updatedPositions.total,
      );
    }
  }

  function updateState(state: Partial<z.infer<typeof searchParamsSchema>>) {
    setSearchParamsState({
      ...searchParamsState,
      ...state,
    });
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
          current: positionsContext.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(positionsContext.total / searchParamsState.count),
        }}
        totalItems={positionsContext.total}
      >
        <Modal
          opened={createModalOpened}
          onClose={closeCreateModal}
          title={"Create Position"}
        >
          <CreatePositionForm
            action={props.createPosition}
            onSuccess={(): void => {
              updatePositions();
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
            action={props.updatePosition}
            onSuccess={(): void => {
              updatePositions();
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
          {positionsContext.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {positionsContext.positions.map((position) => {
            return (
              <PositionCard
                key={position.position_id}
                deleteAction={props.deletePosition}
                editAction={() => {
                  setSelectedPosition(position);
                  openEditModal();
                }}
                onDeleteSuccess={updatePositions}
                position={position}
              />
            );
          })}
          {positionsContext.total > 0 && (
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
function useCurrentRange(): `${number} - ${number}` {
  const positionsContext = usePositions();
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = positionsContext.page * count;

  const start = (positionsContext.page - 1) * count + 1;
  const end =
    positionsContext.total < endIndex ? positionsContext.total : endIndex;

  return `${start} - ${end}`;
}
