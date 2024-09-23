import ErrorPage from "@/components/ErrorPage";
import { hasPermission } from "@/lib/auth/server";
import { notFound } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await hasPermission("Admin.Positions", "Admin.Roles", "Admin.Users")) {
    return <>{children}</>;
  } else {
    return <ErrorPage code={403} message="Forbidden" />;
  }
}
