export function getUserName(
  user:
    | {
        first_name: string;
        last_name: string;
        nickname?: string;
      }
    | { firstName: string; lastName: string },
) {
  if ("nickname" in user) {
    return user.nickname;
  }
  if ("firstName" in user) {
    return `${user.firstName} ${user.lastName}`;
  }
  return `${user.first_name} ${user.last_name}`;
}
