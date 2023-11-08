import * as Quotes from "@/features/quotes";
import { requirePermission } from "@/lib/auth/server";
import { AddQuote, QuoteView } from "./AddEditQuoteForm";

export default async function QuotesPage(props: {
  searchParams: { page?: string };
}) {
  await requirePermission("ManageQuotes");
  const page = parseInt(props.searchParams?.page || "1");
  const [quotes, total] = await Promise.all([
    Quotes.getQuotes(page),
    Quotes.getTotalQuotes(),
  ]);

  return (
    <div>
      <h1>Quotes</h1>
      <p>
        Page {page} of {Math.ceil(total / 10)}
      </p>
      <AddQuote />
      <ul>
        {quotes.map((quote) => (
          <li key={quote.quote_id} className="list-none">
            <QuoteView data={quote} />
          </li>
        ))}
      </ul>
    </div>
  );
}
