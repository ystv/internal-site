import { Prisma, PrismaClient } from "@prisma/client";

if (process.env.NEXT_RUNTIME) {
  throw new Error("Can only run seed.ts as a standalone script");
}

const seedPositions: Prisma.PositionCreateInput[] = [
  {
    name: "Producer",
    brief_description: "Produce the production.",
    full_description: "Produce the production.",
    admin: true,
  },
];

(async function () {
  const prisma = new PrismaClient();
  for (const pos of seedPositions) {
    const c = await prisma.position.count({
      where: {
        name: pos.name,
      },
    });
    if (c === 0) {
      await prisma.position.create({
        data: pos,
      });
    }
  }

  await prisma.role.upsert({
    where: {
      name: "SuperUser",
    },
    create: {
      name: "SuperUser",
      role_permissions: {
        create: [
          {
            permission: "SuperUser",
          },
        ],
      },
    },
    update: {},
  });
})();
