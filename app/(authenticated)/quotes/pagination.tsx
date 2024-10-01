"use client";

import { Pagination } from "@mantine/core";
import { useRouter } from "next/navigation";

export function QuotesPagination({
  page,
  total,
  pageSize,
}: {
  page: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();

  const totalPages = Math.ceil(total / pageSize);
  return (
    <>
      <Pagination
        total={totalPages}
        value={page}
        withEdges
        onChange={(page) => {
          router.push(`/quotes?page=${page}`);
        }}
      />
    </>
  );
}
