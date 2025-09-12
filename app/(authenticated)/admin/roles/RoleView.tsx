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
import { type RoleWithPermissions } from "@/features/people";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { useValidSearchParams } from "@/lib/searchParams/validateHook";

import {
  createRoleAction,
  deleteRoleAction,
  fetchRolesAction,
  type TFetchRoles,
  updateRoleAction,
} from "./actions";
import { CreateRoleForm, UpdateRoleForm } from "./form";
import { RoleCard } from "./RoleCard";
import { searchParamsSchema } from "./schema";

export function RoleView(props: { initialRoles: TFetchRoles }) {
  const pathname = usePathname();
  const router = useRouter();

  // Get and force validate search params
  const rawSearchParams = useSearchParams();
  const validSearchParams = useValidSearchParams(
    searchParamsSchema,
    rawSearchParams,
  );

  const rolesQuery = useQuery({
    initialData: props.initialRoles,
    queryKey: ["admin:roles", validSearchParams],
    queryFn: async () => {
      const res = await fetchRolesAction(validSearchParams);
      if (!res.ok) {
        throw new Error("An error occurred updating roles.");
      } else {
        return res;
      }
    },
  });

  const currentRange = useCurrentRange(rolesQuery.data);

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
  const [selectedRole, setSelectedRole] = useState<
    RoleWithPermissions | undefined
  >();

  function updateState(state: Partial<z.infer<typeof searchParamsSchema>>) {
    setSearchParamsState({
      ...searchParamsState,
      ...state,
    });
  }

  if (!rolesQuery.isSuccess) {
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
          current: rolesQuery.data.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(rolesQuery.data.total / searchParamsState.count),
        }}
        totalItems={rolesQuery.data.total}
      >
        <Modal
          opened={createModalOpened}
          onClose={closeCreateModal}
          title={"Create Role"}
        >
          <CreateRoleForm
            action={createRoleAction}
            onSuccess={(): void => {
              rolesQuery.refetch();
              closeCreateModal();
            }}
          />
        </Modal>
        <Modal
          opened={editModalOpened}
          onClose={closeEditModal}
          title={"Edit Role"}
        >
          <UpdateRoleForm
            action={updateRoleAction}
            onSuccess={(): void => {
              rolesQuery.refetch();
              closeEditModal();
            }}
            selectedRole={selectedRole}
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
            label="Search by Role Name or Permissions"
            description="Only one permission can be searched at a time."
            withClear
          />
          <Group>
            <Button leftSection={<FaPlus />} onClick={openCreateModal}>
              Create Role
            </Button>
          </Group>
          {rolesQuery.data.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {rolesQuery.data.roles.map((role) => {
            return (
              <RoleCard
                key={role.role_id}
                deleteAction={deleteRoleAction}
                editAction={() => {
                  setSelectedRole(role);
                  openEditModal();
                }}
                onDeleteSuccess={rolesQuery.refetch}
                role={role}
                searchQuery={searchParamsState.query}
              />
            );
          })}
          {rolesQuery.data.total > 0 && (
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
function useCurrentRange(rolesData: TFetchRoles): `${number} - ${number}` {
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = rolesData.page * count;

  const start = (rolesData.page - 1) * count + 1;
  const end = rolesData.total < endIndex ? rolesData.total : endIndex;

  return `${start} - ${end}`;
}
