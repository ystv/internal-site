import { prisma } from "@/prisma";

export async function findVideoByID(id: number) {
  return await prisma.items.findFirst({
    where: {
      video_id: id
    }
  });
}
