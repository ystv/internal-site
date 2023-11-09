"use client";

import {
  PaginationRoot,
  PaginationFirst,
  PaginationPrevious,
  PaginationItems,
  PaginationNext,
  PaginationLast,
  Group,
} from "@mantine/core";
import Link from "next/link";

export function QuotesPagination({
  page,
  total,
  pageSize,
}: {
  page: number;
  total: number;
  pageSize: number;
}) {
  return (
    <PaginationRoot
      total={Math.ceil(total / pageSize)}
      value={page}
      getItemProps={(page) => ({
        component: Link,
        href: `/quotes?page=${page}`,
      })}
    >
      <Group gap={5}>
        {page > 1 && (
          <>
            <PaginationFirst component={Link} href="/quotes?page=1" />
            <PaginationPrevious
              component={Link}
              href={`/quotes?page=${page - 1}`}
            />
          </>
        )}
        {total / pageSize > 1 && <PaginationItems />}
        {page < total / pageSize && (
          <>
            <PaginationNext
              component={Link}
              href={`/quotes?page=${page + 1}`}
            />
            <PaginationLast
              component={Link}
              href={`/quotes?page=${Math.ceil(total / pageSize)}`}
            />
          </>
        )}
      </Group>
    </PaginationRoot>
  );
}
