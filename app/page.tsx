import { NotLoggedIn } from "@/lib/auth/errors";
import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Home() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (e) {
    if (e instanceof NotLoggedIn) {
      redirect("/login");
    }
    throw e;
  }
  return (
    <main>
      hello boss <pre>{JSON.stringify(user, null, 2)}</pre>
    </main>
  );
}
