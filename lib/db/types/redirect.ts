import * as z from "zod"

export const _RedirectModel = z.object({
  redirect_id: z.number().int(),
  source_url: z.string(),
  destination_url: z.string(),
  external: z.boolean().nullish(),
})
