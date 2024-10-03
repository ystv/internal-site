import { z } from "zod";

export const addWebcamSchema = z.object({
  full_name: z.string(),
  identifier: z.string(),
  stream_url: z.string(),
});

export const editWebcamSchema = z.object({
  webcam_id: z.number(),
  full_name: z.string(),
  identifier: z.string(),
  stream_url: z.string(),
});

export const removeWebcamSchema = z.object({
  webcam_id: z.number(),
});
