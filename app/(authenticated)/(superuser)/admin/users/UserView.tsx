"use client";

import { FormResponse } from "@/components/Form";
import { UserWithIdentities, useUsers } from "@/components/UsersContext";
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
import { Identity, User } from "@prisma/client";
import { usePathname, useSearchParams } from "next/navigation";
import { searchParamsSchema } from "./schema";
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
import { modals } from "@mantine/modals";
import { SearchBar } from "@/components/SearchBar";
// import { CreateUserForm, UpdateUserForm } from "./form";
import { useValidSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { UserCard } from "./UserCard";

export function UserView(props: {
  fetchUsers: (
    data: z.infer<typeof searchParamsSchema>,
  ) => Promise<
    FormResponse<{ users: UserWithIdentities[]; page: number; total: number }>
  >;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const usersContext = useUsers();

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
      updateUsers();
    }
  }, [searchParamsState]);

  // States for modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  async function updateUsers() {
    const updatedUsers = await props.fetchUsers(searchParamsState);

    if (updatedUsers.ok) {
      usersContext.updateContext(
        updatedUsers.users,
        updatedUsers.page,
        updatedUsers.total,
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
          current: usersContext.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(usersContext.total / searchParamsState.count),
        }}
        totalItems={usersContext.total}
      >
        <Modal
          opened={editModalOpened}
          onClose={closeEditModal}
          title={"Edit User"}
        ></Modal>
        <Stack>
          <SearchBar
            default={validSearchParams.query}
            onChange={(query) => {
              updateState({
                query: query !== "" ? query : undefined,
              });
            }}
            label="Search by Name or Email"
            description="Search must start of the first, last or nick name, or username."
            withClear
          />
          <Group></Group>
          {usersContext.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {usersContext.users.map((user) => {
            return (
              <UserCard
                key={user.user_id}
                // deleteAction={props.deleteUser}
                // editAction={() => {
                //   setSelectedUser(user);
                //   openEditModal();
                // }}
                // onDeleteSuccess={updateUsers}
                user={user}
                searchQuery={searchParamsState.query}
              />
            );
          })}
          {usersContext.total > 0 && (
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
  userName: string;
}) =>
  modals.openConfirmModal({
    title: `Delete user "${props.userName}"`,
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete the user &quot;{props.userName}
        &quot;? This action is destructive and will remove all crew sheet roles
        this references.
      </Text>
    ),
    labels: { confirm: "Delete user", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onCancel: props.onCancel,
    onConfirm: props.onConfirm,
  });

/**
 * @returns A string in the format `[start] - [end]` representing the range of currently displayed items
 */
function useCurrentRange(): `${number} - ${number}` {
  const usersContext = useUsers();
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = usersContext.page * count;

  const start = (usersContext.page - 1) * count + 1;
  const end = usersContext.total < endIndex ? usersContext.total : endIndex;

  return `${start} - ${end}`;
}
