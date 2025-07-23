import { cookies } from "next/headers";

import { CookieView } from "./CookiesView";

export default async function BIOSPage() {
  const cookieStore = await cookies();

  return <CookieView cookies={cookieStore.getAll()} />;
}
