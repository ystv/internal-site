import { cookies } from "next/headers";
import { CookieView } from "./CookiesView";

export default function BIOSPage() {
  const cookieStore = cookies();

  return <CookieView cookies={cookieStore.getAll()} />;
}
