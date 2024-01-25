import * as z from "zod"

export const _QuoteModel = z.object({
  quote_id: z.number().int(),
  text: z.string(),
  context: z.string(),
  created_at: z.date(),
  created_by: z.number().int(),
  deleted_at: z.date().nullish(),
})
