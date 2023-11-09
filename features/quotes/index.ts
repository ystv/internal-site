import { prisma } from "@/lib/db";

export async function getQuotes(page: number, pageSize: number) {
  return await prisma.quote.findMany({
    orderBy: {
      created_at: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function getTotalQuotes() {
  return await prisma.quote.count();
}

export async function addQuote(text: string, context: string, userID: number) {
  await prisma.quote.create({
    data: {
      text,
      context,
      created_by: userID,
    },
  });
}
export function editQuote(id: number, text: string, context?: string) {
  return prisma.quote.update({
    where: {
      quote_id: id,
    },
    data: {
      text,
      context,
    },
  });
}

export function deletQuote(id: number) {
  return prisma.quote.delete({
    where: {
      quote_id: id,
    },
  });
}
