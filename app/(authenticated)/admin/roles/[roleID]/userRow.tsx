"use client";

import { useRouter } from "next/navigation";

export function UserRow(
  {
    user,
  }: {
    user: {
      user_id: number;
      first_name: string;
      last_name: string;
      nickname: string;
      avatar: string;
    };
  },
  { key }: { key: number },
) {
  const router = useRouter();

  return (
    <>
      <li
        key={key}
        className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
        style={{ height: "40px" }}
        onClick={() => router.push(`/admin/users/${user.user_id}`)}
      >
        {user.first_name}{" "}
        {user.nickname.length > 0 ? "(" + user.nickname + ")" : null}{" "}
        {user.last_name}
      </li>
    </>
  );
}
