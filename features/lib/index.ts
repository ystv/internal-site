import { prisma } from "../../lib/db";
import { Prisma } from "@prisma/client";

export function dbHealthCheck() {
  return prisma.$executeRaw(Prisma.sql`SELECT 1;`);
}
