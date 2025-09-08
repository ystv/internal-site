import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "lib/db/schema.prisma",
  migrations: {
    seed: "tsx scripts/seed.mts",
  },
});
