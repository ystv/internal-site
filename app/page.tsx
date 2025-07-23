import { redirect } from "next/navigation";

import { NotLoggedIn } from "@/lib/auth/errors";
import { getCurrentUser } from "@/lib/auth/server";

export default async function Home() {
  try {
    await getCurrentUser();
    redirect("/calendar");
  } catch (e) {
    if (e instanceof NotLoggedIn) {
      redirect("/login");
    }
    throw e;
  }
}
