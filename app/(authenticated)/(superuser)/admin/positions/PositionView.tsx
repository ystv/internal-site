"use client";

import Form, { FormResponse } from "@/components/Form";
import { usePositions } from "@/components/PositionsContext";
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Position } from "@prisma/client";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import {
  getSearchParamsString,
  useValidSearchParams,
  useRevalidateClientSearchParams,
  searchParamsSchema,
  useUpdateClientSearchParams,
  createPositionSchema,
  deletePositionSchema,
  updatePositionSchema,
} from "./schema";
import { router } from "@trpc/server";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { CountControls, PageControls } from "@/components/Pagination";
import { useDisclosure } from "@mantine/hooks";
import { TextAreaField, TextField } from "@/components/FormFields";
import { modals } from "@mantine/modals";

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
  updateCountPageSearch: (
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

  // Used for displaying items in current view
  const currentRange = useCurrentRange();

  const [searchParamsState, setSearchParamsState] = useState(validSearchParams);

  // Search bar state
  const [searchQueryState, setSearchQueryState] = useState<string | undefined>(
    validSearchParams.query,
  );

  // Push search params changes to router on state change
  useEffect(() => {
    const newSearchParamsString = getSearchParamsString(searchParamsState);
    if (getSearchParams.toString() != newSearchParamsString) {
      router.push(`${pathname}?${newSearchParamsString}`);
      updatePositions();
    }
  }, [searchParamsState]);

  // Update search params state on positions page change
  useEffect(() => {
    setSearchParamsState({
      ...searchParamsState,
      page: positionsContext.page,
    });
  }, [positionsContext.page]);

  // Delay update searchParams on query change to avoid spamming requests
  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setSearchParamsState({
        ...searchParamsState,
        query: searchQueryState !== "" ? searchQueryState : undefined,
      });
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [searchQueryState, 500]);

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
    const updatedPositions =
      await props.updateCountPageSearch(searchParamsState);

    if (updatedPositions.ok) {
      positionsContext.updateContext(
        updatedPositions.positions,
        updatedPositions.page,
        updatedPositions.total,
      );
    }
  }

  return (
    <>
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title={"Create Position"}
      >
        <Form
          action={props.createPosition}
          onSuccess={(res): void => {
            updatePositions();
            closeCreateModal();
          }}
          schema={z.object({
            name: z.string(),
            brief_description: z.string().optional(),
            full_description: z.string().optional(),
          })}
        >
          <TextField name="name" label="Name" required />
          <TextAreaField
            name="brief_description"
            label="Brief Description"
            autosize
            minRows={1}
          />
          <TextAreaField
            name="full_description"
            label="Full Description"
            autosize
          />
        </Form>
      </Modal>
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title={"Edit Position"}
      >
        <Form
          action={(data) => {
            if (!selectedPosition) {
              throw new Error("No selected position");
            }
            return props.updatePosition({
              position_id: selectedPosition.position_id,
              ...data,
            });
          }}
          onSuccess={(res): void => {
            updatePositions();
            closeEditModal();
            setSelectedPosition(undefined);
          }}
          schema={updatePositionSchema.omit({ position_id: true })}
          initialValues={{
            name: selectedPosition?.name,
            brief_description: selectedPosition?.brief_description,
            full_description: selectedPosition?.full_description,
          }}
        >
          <TextField name="name" label="Name" required />
          <TextAreaField
            name="brief_description"
            label="Brief Description"
            autosize
            minRows={1}
          />
          <TextAreaField
            name="full_description"
            label="Full Description"
            autosize
          />
        </Form>
      </Modal>
      <Stack>
        <TextInput
          defaultValue={validSearchParams.query}
          onChange={async (event) => {
            setSearchQueryState(event.currentTarget.value);
          }}
        />
        <Group>
          <Button onClick={openCreateModal}>Create Position</Button>
        </Group>
        {positionsContext.total > 0 ? (
          <>
            <CountControls
              current={searchParamsState.count.toString()}
              setCount={(count) =>
                setSearchParamsState({ ...searchParamsState, count: count })
              }
              values={["10", "25", "50", "100"]}
              currentRange={currentRange}
              total={positionsContext.total}
            />
            <Center w={"max"}>
              <PageControls
                setPage={positionsContext.setPage}
                currentPage={positionsContext.page}
                totalPages={Math.ceil(
                  positionsContext.total / searchParamsState.count,
                )}
              />
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
                <ActionIcon
                  onClick={() => {
                    setSelectedPosition(position);
                    openEditModal();
                  }}
                  ml={"auto"}
                >
                  <FaEdit />
                </ActionIcon>
                <ActionIcon
                  aria-label="Delete position"
                  color="red"
                  onClick={() => {
                    openDeleteModal({
                      onCancel: () => {},
                      onConfirm: async () => {
                        const deletedPosition = await props.deletePosition({
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
                  <MdDeleteForever />
                </ActionIcon>
              </Group>
            </Card>
          );
        })}
        {positionsContext.total > 0 && (
          <>
            <CountControls
              current={searchParamsState.count.toString()}
              setCount={(count) =>
                setSearchParamsState({ ...searchParamsState, count: count })
              }
              values={["10", "25", "50", "100"]}
              currentRange={currentRange}
              total={positionsContext.total}
            />
            <Center w={"max"}>
              <PageControls
                setPage={positionsContext.setPage}
                currentPage={positionsContext.page}
                totalPages={Math.ceil(
                  positionsContext.total / searchParamsState.count,
                )}
              />
            </Center>
          </>
        )}
      </Stack>
    </>
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

function useCurrentRange(): string {
  const positionsContext = usePositions();
  const count = Number(useSearchParams().get("count")) as number;
  return `${(positionsContext.page - 1) * count + 1} - ${((endIndex: number) =>
    positionsContext.total < endIndex ? positionsContext.total : endIndex)(
    positionsContext.page * count,
  )}`;
}
