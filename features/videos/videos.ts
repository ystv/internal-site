import { prisma } from "@/lib/db";

export async function findVideoByID(id: number) {
  return await prisma.videoItem.findFirst({
    where: {
      video_id: id,
    },
  });
}
