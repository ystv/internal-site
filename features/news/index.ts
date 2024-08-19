import { prisma } from "@/lib/db";

export async function getLatestNewsItem() {
  return await prisma.newsItem.findFirst({
    where: {
      OR: [{ expires: null }, { expires: { gt: new Date() } }],
    },
    orderBy: {
      time: "desc",
    },
    take: 1,
    include: {
      author: true,
    },
  });
}
