"use client";

import { FormResponse } from "@/components/Form";
import { useRoles } from "@/components/RolesContext";
import {
  Button,
  Center,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createRoleSchema,
  deleteRoleSchema,
  searchParamsSchema,
  updateRoleSchema,
} from "./schema";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  CountControls,
  PageControls,
  PaginationProvider,
} from "@/components/Pagination";
import { useDisclosure } from "@mantine/hooks";
import { SearchBar } from "@/components/SearchBar";
import { useValidSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { RoleCard } from "./RoleCard";
import { CreateRoleForm, UpdateRoleForm } from "./form";
import { FaPlus } from "react-icons/fa";
import { RoleWithPermissions } from "@/features/people";

export function RoleView(props: {
  fetchRoles: (
    data: z.infer<typeof searchParamsSchema>,
  ) => Promise<
    FormResponse<{ roles: RoleWithPermissions[]; page: number; total: number }>
  >;
  createRole: (data: z.infer<typeof createRoleSchema>) => Promise<FormResponse>;
  updateRole: (data: z.infer<typeof updateRoleSchema>) => Promise<FormResponse>;
  deleteRole: (data: z.infer<typeof deleteRoleSchema>) => Promise<FormResponse>;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const rolesContext = useRoles();

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
      updateRoles();
    }
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

  async function updateRoles() {
    const updatedRoles = await props.fetchRoles(searchParamsState);

    if (updatedRoles.ok) {
      rolesContext.updateContext(
        updatedRoles.roles,
        updatedRoles.page,
        updatedRoles.total,
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
          current: rolesContext.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(rolesContext.total / searchParamsState.count),
        }}
        totalItems={rolesContext.total}
      >
        <Modal
          opened={createModalOpened}
          onClose={closeCreateModal}
          title={"Create Position"}
        >
          <CreateRoleForm
            action={props.createRole}
            onSuccess={(): void => {
              updateRoles();
              closeCreateModal();
            }}
          />
        </Modal>
        <Modal
          opened={editModalOpened}
          onClose={closeEditModal}
          title={"Edit Position"}
        >
          <UpdateRoleForm
            action={props.updateRole}
            onSuccess={(): void => {
              updateRoles();
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
            description="Due to the way this search works, only one permission can be searched at a time."
            withClear
          />
          <Group>
            <Button leftSection={<FaPlus />} onClick={openCreateModal}>
              Create Role
            </Button>
          </Group>
          {rolesContext.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {rolesContext.roles.map((role) => {
            return (
              <RoleCard
                key={role.role_id}
                deleteAction={props.deleteRole}
                editAction={() => {
                  setSelectedRole(role);
                  openEditModal();
                }}
                onDeleteSuccess={updateRoles}
                role={role}
                searchQuery={searchParamsState.query}
              />
            );
          })}
          {rolesContext.total > 0 && (
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
  const rolesContext = useRoles();
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = rolesContext.page * count;

  const start = (rolesContext.page - 1) * count + 1;
  const end = rolesContext.total < endIndex ? rolesContext.total : endIndex;

  return `${start} - ${end}`;
}
