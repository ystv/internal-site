import * as Quotes from "@/features/quotes";
import { requirePermission } from "@/lib/auth/server";
import { AddQuote, QuoteView } from "./AddEditQuoteForm";
import { Stack } from "@mantine/core";
import { QuotesPagination } from "./pagination";
import { SetClientData } from "@/components/SetClientData";

export const dynamic = "force-dynamic";

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
      <SetClientData title="Quotes Board" />
      <h1>Quotes</h1>
      <Stack>
        {total > 0 ? (
          <p>
            Page {page} of {Math.ceil(total / PAGE_SIZE)}
          </p>
        ) : (
          <>
            <p>No quotes just yet...</p>
          </>
        )}
        <AddQuote />
        {/* <Group>
        </Group> */}
        {quotes.map((quote) => (
          <QuoteView key={quote.quote_id} data={quote} />
        ))}
        <QuotesPagination page={page} total={total} pageSize={PAGE_SIZE} />
      </Stack>
    </div>
  );
}
