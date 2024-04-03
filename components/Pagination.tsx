import {
  Group,
  InputLabel,
  NativeSelect,
  Pagination,
  Text,
} from "@mantine/core";
import React, { createContext, useContext } from "react";

/**
 * Relies on PaginationContext
 */
export function PageControls() {
  const pagination = usePaginationContext();

  return (
    <Pagination
      withEdges
      siblings={1}
      boundaries={0}
      onChange={pagination.page.set}
      total={pagination.page.total}
      value={pagination.page.current}
    />
  );
}

/**
 * Relies on PaginationContext
 */
export function CountControls() {
  const pagination = usePaginationContext();

  return (
    <Group>
      {pagination.count.range != undefined && (
        <>
          <Text>
            Showing {pagination.count.range}{" "}
            {pagination.totalItems != undefined && (
              <>of {pagination.totalItems}</>
            )}
          </Text>
        </>
      )}
      <InputLabel ml={"auto"}>Show</InputLabel>
      <NativeSelect
        value={
          pagination.count.values.includes(`${pagination.count.current}`)
            ? pagination.count.current
            : "custom"
        }
        onChange={async (event) => {
          const newCount = Number(event.currentTarget.value);
          pagination.count.set(newCount);
        }}
      >
        {pagination.count.values.map((selectValue) => {
          return (
            <option value={selectValue} key={selectValue}>
              {selectValue}
            </option>
          );
        })}
        {/* Allows custom count values to be entered 
              without showing them in the list */}
        {!pagination.count.values.includes(`${pagination.count.current}`) && (
          <option value={"custom"} hidden>
            {pagination.count.current}
          </option>
        )}
      </NativeSelect>
    </Group>
  );
}

type TPaginationContext = {
  page: {
    current: number;
    set: (page: number) => void;
    total: number;
  };
  count: {
    current: number;
    set: (count: number) => void;
    values: string[];
    range?: string | undefined;
  };
  totalItems?: number;
};

const PaginationContext = createContext<TPaginationContext>(
  null as unknown as TPaginationContext,
);

export function PaginationProvider(props: {
  children: React.ReactNode;
  page: {
    current: number;
    set: (page: number) => void;
    total: number;
  };
  count: {
    current: number;
    set: (count: number) => void;
    values: string[];
    range?: string | undefined;
  };
  totalItems?: number;
}) {
  return (
    <PaginationContext.Provider
      value={{
        page: props.page,
        count: props.count,
        totalItems: props.totalItems,
      }}
    >
      {props.children}
    </PaginationContext.Provider>
  );
}

export const usePaginationContext = () => useContext(PaginationContext);
