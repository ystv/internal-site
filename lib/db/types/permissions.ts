import * as z from "zod"

export const _permissionsModel = z.object({
  permission_id: z.number().int(),
  name: z.string(),
  description: z.string().nullish(),
})
