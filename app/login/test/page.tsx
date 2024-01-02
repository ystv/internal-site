import { TEST_ONLY_setSession } from "@/lib/auth/server";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { prisma } from "@/lib/db";
import invariant from "@/lib/invariant";
import { redirect } from "next/navigation";

export default async function TestLoginPage() {
  invariant(process.env.E2E_TEST === "true", "This page is only for e2e testing");
  const users = await prisma.user.findMany();
  async function login(userID: number) {
    "use server";
    invariant(process.env.E2E_TEST === "true", "This page is only for e2e testing");
    await TEST_ONLY_setSession({ userID });
    redirect("/");
  }
  return (
    <div>
      <h1>Test Login</h1>
      <form>
        <ul>
          {users.map((user) => (
            <li key={user.user_id}>
              <button formAction={login.bind(null, user.user_id)}>{user.email}</button>
            </li>
          ))}
        </ul>
      </form>
    </div>
  )
}