"use client";

import { useRouter } from "next/navigation";

// import {UserType} from "@/features/user";

export function UserRow({
  user,
}: {
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    nickname: string;
    avatar: string;
  };
}) {
  const router = useRouter();

  return (
    <>
      <tr
        key={user.user_id}
        className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
        style={{ height: "40px" }}
        onClick={() => router.push(`/admin/users/${user.user_id}`)}
      >
        <td style={{ textAlign: "center" }}>{user.user_id}</td>
        <td style={{ textAlign: "center" }}>{user.first_name}</td>
        <td style={{ textAlign: "center" }}>{user.last_name}</td>
        <td style={{ textAlign: "center" }}>{user.nickname}</td>
      </tr>
    </>
  );
}
