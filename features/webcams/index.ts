import {
  addWebcamSchema,
  editWebcamSchema,
  removeWebcamSchema,
} from "@/app/(authenticated)/webcam/schema";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function fetchWebcamFeeds() {
  return await prisma.webcamFeed.findMany();
}

export async function addWebcamFeed(data: z.infer<typeof addWebcamSchema>) {
  return await prisma.webcamFeed.create({ data });
}

export async function editWebcamFeed(data: z.infer<typeof editWebcamSchema>) {
  return await prisma.webcamFeed.update({
    where: { webcam_id: data.webcam_id },
    data: {
      full_name: data.full_name,
      identifier: data.identifier,
      stream_url: data.stream_url,
    },
  });
}

export async function removeWebcamFeed(
  data: z.infer<typeof removeWebcamSchema>,
) {
  return await prisma.webcamFeed.delete({
    where: {
      webcam_id: data.webcam_id,
    },
  });
}
