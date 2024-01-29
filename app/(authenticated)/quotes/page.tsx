import * as Quotes from "@/features/quotes";
import { requirePermission } from "@/lib/auth/server";
import { AddQuote, QuoteView } from "./AddEditQuoteForm";
import { QuotesPagination } from "./pagination";
import { SearchQuotes } from "./search";

const PAGE_SIZE = 25;

export default async function QuotesPage(props: {
  searchParams: { page?: string; search?: string };
}) {
  await requirePermission("ManageQuotes");
  const page = parseInt(props.searchParams?.page || "1");
  const search = props.searchParams?.search || "";
  const [quotes, total] = await Promise.all([
    search
      ? Quotes.searchQuotes(search, page, PAGE_SIZE)
      : Quotes.getQuotes(page, PAGE_SIZE),
    Quotes.getTotalQuotes(search),
  ]);

  return (
    <div>
      <h1>Quotes</h1>
      <SearchQuotes />
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
