import {
  addWebcamSchema,
  editWebcamSchema,
  removeWebcamSchema,
} from "@/app/(authenticated)/webcam/schema";
import { requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function fetchWebcamFeeds() {
  await requirePermission("Webcams.View");
  return await prisma.webcamFeed.findMany();
}

export async function addWebcamFeed(data: z.infer<typeof addWebcamSchema>) {
  await requirePermission("Webcams.Manage");
  return await prisma.webcamFeed.create({ data });
}

export async function editWebcamFeed(data: z.infer<typeof editWebcamSchema>) {
  await requirePermission("Webcams.Manage");
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
  await requirePermission("Webcams.Manage");
  return await prisma.webcamFeed.delete({
    where: {
      webcam_id: data.webcam_id,
    },
  });
}
