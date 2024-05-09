import { expect, test } from "./fixtures";

test("Can see calendar", async ({ loggedInPage }) => {
  await expect(
    loggedInPage.getByRole("heading", { name: "YSTV Calendar " }),
  ).toBeVisible();
});
