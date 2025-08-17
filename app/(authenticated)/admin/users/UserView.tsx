"use client";

import {
  Center,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { type z } from "zod";

import {
  CountControls,
  PageControls,
  PaginationProvider,
} from "@/components/navigation/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { useValidSearchParams } from "@/lib/searchParams/validateHook";

import { fetchUsersAction, type TFetchUsers } from "./actions";
import { searchParamsSchema } from "./schema";
import { UserCard } from "./UserCard";

export function UserView(props: { initialUsers: TFetchUsers }) {
  const pathname = usePathname();
  const router = useRouter();

  // Get and force validate search params
  const rawSearchParams = useSearchParams();
  const validSearchParams = useValidSearchParams(
    searchParamsSchema,
    rawSearchParams,
  );

  const usersQuery = useQuery({
    initialData: props.initialUsers,
    queryKey: ["admin:users", validSearchParams],
    queryFn: async () => {
      const res = await fetchUsersAction(validSearchParams);
      if (!res.ok) {
        throw new Error("An error occurred updating roles." + res.errors);
      } else {
        return res;
      }
    },
  });

  const currentRange = useCurrentRange(usersQuery.data);

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

  function updateState(state: Partial<z.infer<typeof searchParamsSchema>>) {
    setSearchParamsState({
      ...searchParamsState,
      ...state,
    });
  }

  if (!usersQuery.isSuccess) {
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
          current: usersQuery.data.page,
          set(page) {
            updateState({ page });
          },
          total: Math.ceil(usersQuery.data.total / searchParamsState.count),
        }}
        totalItems={usersQuery.data.total}
      >
        <Stack>
          <SearchBar
            default={validSearchParams.query}
            onChange={(query) => {
              updateState({
                query: query !== "" ? query : undefined,
              });
            }}
            label="Search by Name or Email"
            description="Search must start with the first, last, or nick name."
            withClear
          />
          <Group></Group>
          {usersQuery.data.total > 0 ? (
            <>
              <CountControls />
              <Center w={"max"}>
                <PageControls />
              </Center>
            </>
          ) : (
            <Text>No results</Text>
          )}
          {usersQuery.data.users.map((user) => {
            return (
              <UserCard
                key={user.user_id}
                user={user}
                searchQuery={searchParamsState.query}
              />
            );
          })}
          {usersQuery.data.total > 0 && (
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
function useCurrentRange(usersData: TFetchUsers): `${number} - ${number}` {
  const count = Number(useSearchParams().get("count")) as number;
  const endIndex = usersData.page * count;

  const start = (usersData.page - 1) * count + 1;
  const end = usersData.total < endIndex ? usersData.total : endIndex;

  return `${start} - ${end}`;
}
