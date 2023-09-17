import { ExposedUser } from "@/features/people";

export function getUserName(user: ExposedUser) {
  if ("nickname" in user && (user.nickname?.length ?? 0) > 0) {
    if (user.nickname !== user.first_name) {
      return `${user.first_name} "${user.nickname}" ${user.last_name}`;
    }
    return `${user.nickname} ${user.last_name}`;
  }
  return `${user.first_name} ${user.last_name}`;
}
