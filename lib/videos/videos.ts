import { prisma } from "@/prisma";

export async function findVideoByID(id: number) {
  return await prisma.videoItem.findFirst({
    where: {
      video_id: id,
    },
  });
}
