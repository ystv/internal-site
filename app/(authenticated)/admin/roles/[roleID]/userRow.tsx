"use client";

import { useRouter } from "next/navigation";
import { getUserName } from "@/components/UserHelpers";
import { z } from "zod";
import { RoleUserSchema } from "@/app/(authenticated)/admin/roles/schema";
import Form, { FormResponse } from "@/components/Form";
import { RoleType } from "@/features/role";
import { useState } from "react";
import { Button, Modal } from "@mantine/core";
import { removeUserFromRole } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";

export function RemoveUserFromRoleForm(props: {
  action: (data: z.infer<typeof RoleUserSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  user: string;
  role: string;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={z.any()}
      submitLabel={"Remove"}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Remove User</h1>
      <h2 className={"mb-2 mt-0 text-2xl font-bold"}>
        Are you sure you want to remove {props.user} from {props.role}?
      </h2>
    </Form>
  );
}

export function UserRow({
  user,
  role,
  key,
}: {
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    nickname: string;
    avatar: string;
  };
  role: RoleType;
  key: number;
}) {
  const router = useRouter();

  const [isRemoveOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <li
        key={key}
        className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
        style={{ height: "40px" }}
      >
        <a onClick={() => router.push(`/admin/users/${user.user_id}`)}>
          {getUserName(user)}
        </a>{" "}
        -&nbsp;
        <Button variant="danger" onClick={() => setRemoveOpen(true)}>
          Remove {getUserName(user)}
        </Button>
        <Modal
          opened={isRemoveOpen}
          onClose={() => setRemoveOpen(false)}
          size={"95%"}
        >
          <RemoveUserFromRoleForm
            action={async () => removeUserFromRole(role.role_id, user.user_id)}
            onSuccess={() => router.push(`/admin/roles/` + role.role_id)}
            user={getUserName(user)}
            role={role.name}
          />
          <br />
        </Modal>
      </li>
    </>
  );
}
