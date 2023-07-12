import * as z from "zod"

export const _ProjectModel = z.object({
  project_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  start_date: z.date(),
  end_date: z.date(),
})
