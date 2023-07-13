"use server";
import { getCurrentUser } from "@/lib/auth/server";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <main>
      hello boss <pre>{JSON.stringify(user, null, 2)}</pre>
    </main>
  );
}
