import type { PrismaConfig } from "prisma/config";

export default {
  schema: "lib/db/schema.prisma",
  migrations: {
    seed: "tsx scripts/seed.mts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig;
