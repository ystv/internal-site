export function getUserName(user: {
  first_name: string;
  last_name: string;
  nickname?: string;
}) {
  if ("nickname" in user && (user.nickname?.length ?? 0) > 0) {
    if (user.nickname !== user.first_name) {
      return `${user.first_name} "${user.nickname}" ${user.last_name}`;
    }
    return `${user.nickname} ${user.last_name}`;
  }
  return `${user.first_name} ${user.last_name}`;
}
