"use server";

import { z } from "zod";
import { AddQuoteSchema, EditQuoteSchema } from "./schema";
import * as Quotes from "@/features/quotes";
import { getCurrentUser, requirePermission } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

export async function addQuote(dataRaw: unknown) {
  await requirePermission("ManageQuotes");
  const data = AddQuoteSchema.parse(dataRaw);
  await Quotes.addQuote(
    data.text,
    data.context,
    (await getCurrentUser()).user_id,
  );
  revalidatePath("/quotes");
  return { ok: true };
}

export async function editQuote(dataRaw: unknown) {
  await requirePermission("ManageQuotes");
  const data = EditQuoteSchema.parse(dataRaw);
  await Quotes.editQuote(data.quote_id, data.text, data.context);
  revalidatePath("/quotes");
  return { ok: true };
}

export async function deletQuote(id: number) {
  await requirePermission("ManageQuotes");
  await Quotes.deletQuote(id);
  revalidatePath("/quotes");
  return { ok: true };
}
