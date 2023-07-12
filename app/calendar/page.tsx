import { getCurrentUser } from "@/lib/auth/legacy";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  return <div>Hi {user.firstName}</div>;
}
