import * as z from "zod"

export const _TeachingPeriodModel = z.object({
  period_id: z.number().int(),
  year: z.number().int(),
  name: z.string(),
  start: z.date(),
  finish: z.date(),
})
