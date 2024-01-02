import { Permission } from "@/lib/auth/permissions";
import { Page, test as base } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

export const test = base.extend<{
  db: PrismaClient;
  testUser: {
    email: string;
    roles: Array<{
      name: string;
      permissions: Permission[];
    }>;
  };
  loggedInPage: Page;
}>({
  async db({}, use) {
    const db = new PrismaClient();
    await db.$connect();
    await use(db);
    await db.$disconnect();
  },
  testUser: {
    email: "test-user@example.com",
    roles: [],
  },
  async loggedInPage({ db, page, testUser }, use) {
    const user = await db.user.upsert({
      where: {
        email: testUser.email,
      },
      update: {},
      create: {
        email: testUser.email,
        username: testUser.email.replace(/@.+$/, ""),
        first_name: "Test",
        last_name: "User",
      },
    });
    if (testUser.roles.length > 0) {
      await Promise.all(testUser.roles.map(role => db.$transaction(async $db => {
        const roleRec = await $db.role.upsert({
          where: {
            name: role.name,
          },
          update: {},
          create: {
            name: role.name,
          },
        });
        await db.rolePermission.deleteMany({
          where: {
            role_id: roleRec.role_id,
          },
        });
        await db.rolePermission.createMany({
          data: role.permissions.map(permission => ({
            role_id: roleRec.role_id,
            permission,
          })),
        });
        await db.roleMember.upsert({
          where: {
            user_id_role_id: {
              user_id: user.user_id,
              role_id: roleRec.role_id,
            },
          },
          update: {},
          create: {
            user_id: user.user_id,
            role_id: roleRec.role_id,
          },
        });
      })));
    }
    await page.goto("/login/test");
    await page.getByRole("button", { name: testUser.email }).click();
    await page.waitForLoadState("domcontentloaded");
    await use(page);
  },
});

test.beforeEach(async ({ request }) => {
  await request.post("/testing/resetDB");
});

export { expect } from "@playwright/test";
