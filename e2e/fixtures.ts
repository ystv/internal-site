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
    await db.role.createMany({
      data: testUser.roles.map(role => ({
        name: role.name,
      }))
    });
    await page.request.post("/testing/login", {
      failOnStatusCode: true,
      data: {
        email: testUser.email,
      },
    });
    if (testUser.roles.length > 0) {
      await page.request.post("/testing/promote", {
        failOnStatusCode: true,
        data: {
          roles: testUser.roles.map(role => role.name),
        }
      });
    }
    await page.goto("/");
    await use(page);
  }
});

export { expect } from "@playwright/test";
