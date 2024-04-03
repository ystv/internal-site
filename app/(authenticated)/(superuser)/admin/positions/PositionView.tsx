"use client";

import { FormResponse } from "@/components/Form";
import { usePositions } from "@/components/PositionsContext";
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  Menu,
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
import { notifications } from "@mantine/notifications";
import { FaEdit, FaPlus } from "react-icons/fa";
import { MdDeleteForever, MdMoreHoriz } from "react-icons/md";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  CountControls,
  PageControls,
  PaginationProvider,
} from "@/components/Pagination";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { SearchBar } from "@/components/SearchBar";
import { CreatePositionForm, UpdatePositionForm } from "./form";
import { useValidSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";

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
  const getSearchParams = useSearchParams();
  const validSearchParams = useValidSearchParams(
    searchParamsSchema,
    getSearchParams,
  );

  const currentRange = useCurrentRange();

  const [searchParamsState, setSearchParamsState] = useState(validSearchParams);

  // Push search params changes to router on state change
  useEffect(() => {
    const newSearchParamsString = getSearchParamsString(searchParamsState);
    if (
      getSearchParamsString(Object.fromEntries(getSearchParams.entries())) !=
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
              <Card key={position.position_id} withBorder>
                <Group>
                  <Text>{position.name}</Text>
                  <Stack gap={0}>
                    <Text size="sm">{position.brief_description}</Text>
                    <Text size="xs" c={"dimmed"}>
                      {position.full_description}
                    </Text>
                  </Stack>
                  <Menu position="left">
                    <Menu.Target>
                      <ActionIcon ml={"auto"}>
                        <MdMoreHoriz />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown miw={150} right={10} mr={10}>
                      <Menu.Item
                        onClick={() => {
                          setSelectedPosition(position);
                          openEditModal();
                        }}
                      >
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
                              const deletedPosition =
                                await props.deletePosition({
                                  position_id: position.position_id,
                                });

                              if (!deletedPosition.ok) {
                                notifications.show({
                                  message: "Unable to delete position",
                                  color: "red",
                                });
                              } else {
                                updatePositions();
                                notifications.show({
                                  message: `Successfully deleted "${position.name}"`,
                                  color: "green",
                                });
                              }
                            },
                            positionName: position.name,
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
