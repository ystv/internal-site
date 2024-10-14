import ErrorPage from "@/components/util/ErrorPage";
import { hasPermission } from "@/lib/auth/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await hasPermission("Admin.Positions")) {
    return <>{children}</>;
  } else {
    return <ErrorPage code={403} message="Forbidden" />;
  }
}
