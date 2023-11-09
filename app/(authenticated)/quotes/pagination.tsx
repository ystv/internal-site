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
  const totalPages = Math.ceil(total / pageSize)
  return (
    <PaginationRoot
      total={totalPages}
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
        {totalPages > 1 && <PaginationItems />}
        {page < totalPages && (
          <>
            <PaginationNext
              component={Link}
              href={`/quotes?page=${page + 1}`}
            />
            <PaginationLast
              component={Link}
              href={`/quotes?page=${Math.ceil(totalPages)}`}
            />
          </>
        )}
      </Group>
    </PaginationRoot>
  );
}
