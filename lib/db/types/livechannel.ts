import * as z from "zod"

export const _LiveChannelModel = z.object({
  channel_id: z.number().int(),
  url_name: z.string(),
  name: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  output_type: z.string(),
  output_url: z.string(),
  visibility: z.string(),
  status: z.string(),
  location: z.string(),
  scheduled_start: z.date(),
  scheduled_end: z.date(),
})
