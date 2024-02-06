import * as Quotes from "@/features/quotes";
import { requirePermission } from "@/lib/auth/server";
import { AddQuote, QuoteView } from "./AddEditQuoteForm";
import {
  Pagination,
  PaginationFirst,
  PaginationItems,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from "@mantine/core";
import Link from "next/link";
import { QuotesPagination } from "./pagination";

const PAGE_SIZE = 25;

export default async function QuotesPage(props: {
  searchParams: { page?: string };
}) {
  await requirePermission("ManageQuotes");
  const page = parseInt(props.searchParams?.page || "1");
  const [quotes, total] = await Promise.all([
    Quotes.getQuotes(page, PAGE_SIZE),
    Quotes.getTotalQuotes(),
  ]);

  return (
    <div>
      <h1>Quotes</h1>
      <p>
        Page {page} of {Math.ceil(total / PAGE_SIZE)}
      </p>
      <AddQuote />
      <div className="space-y-4">
        {quotes.map((quote) => (
          <QuoteView key={quote.quote_id} data={quote} />
        ))}
      </div>
      <QuotesPagination page={page} total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
