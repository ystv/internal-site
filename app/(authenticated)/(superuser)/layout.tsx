import { mustGetCurrentUser } from "@/lib/auth/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await mustGetCurrentUser();
  if (user.permissions.includes("SuperUser")) {
    return <>{children}</>;
  } else {
    return <p>No permissions sorry</p>;
  }
}
