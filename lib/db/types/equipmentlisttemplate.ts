import * as z from "zod"

export const _EquipmentListTemplateModel = z.object({
  equipment_list_template_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  items: z.string(),
  archived: z.boolean(),
})
