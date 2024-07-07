import * as z from "zod"

export const _WebcamFeedModel = z.object({
  webcam_id: z.number().int(),
  full_name: z.string(),
  identifier: z.string(),
  hls_url: z.string(),
})
