// import "server-only";
import { PrismaClient } from "@prisma/client";
import { env } from "../env";

// Work around for hot reloading in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const rawPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "production"
        ? ["warn", "error"]
        : ["query", "info", "warn", "error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = rawPrisma;

export const prisma = rawPrisma.$extends({
  query: {
    event: {
      $allOperations({ model, operation, args, query }) {
        switch (operation) {
          case "findMany":
          case "findUnique":
          case "findUniqueOrThrow":
          case "findFirst":
          case "findFirstOrThrow":
          case "count":
          case "aggregate":
            if (args.where) {
              args.where.deleted_at = null;
            }
            break;
        }
        return query(args);
      },
    },
  },
});
