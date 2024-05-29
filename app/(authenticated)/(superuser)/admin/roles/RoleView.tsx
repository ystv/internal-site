"use client";

import { FormResponse } from "@/components/Form";
import { RoleWithPermissions, useRoles } from "@/components/RolesContext";
import { Center, Group, Modal, ScrollArea, Stack, Text } from "@mantine/core";
import { Role } from "@prisma/client";
import { usePathname, useSearchParams } from "next/navigation";
import { searchParamsSchema } from "./schema";
import { useRouter } from "next/navigation";
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
// import { CreateRoleForm, UpdateRoleForm } from "./form";
import { useValidSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { RoleCard } from "./RoleCard";

export function RoleView(props: {
  fetchRoles: (
    data: z.infer<typeof searchParamsSchema>,
  ) => Promise<
    FormResponse<{ roles: RoleWithPermissions[]; page: number; total: number }>
  >;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const rolesContext = useRoles();

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
      updateRoles();
    }
  }, [searchParamsState]);

  // States for modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();

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
          opened={editModalOpened}
          onClose={closeEditModal}
          title={"Edit Role"}
        ></Modal>
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
          <Group></Group>
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
                // deleteAction={props.deleteRole}
                // editAction={() => {
                //   setSelectedRole(role);
                //   openEditModal();
                // }}
                // onDeleteSuccess={updateRoles}
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

const openDeleteModal = (props: {
  onCancel: () => void;
  onConfirm: () => void;
  roleName: string;
}) =>
  modals.openConfirmModal({
    title: `Delete role "${props.roleName}"`,
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete the role &quot;{props.roleName}
        &quot;? This action is destructive and will remove all crew sheet roles
        this references.
      </Text>
    ),
    labels: { confirm: "Delete role", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onCancel: props.onCancel,
    onConfirm: props.onConfirm,
  });

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
