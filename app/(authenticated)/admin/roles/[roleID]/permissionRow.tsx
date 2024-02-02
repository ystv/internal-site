"use client";


// import {PermissionType} from "@/features/permission";

import { useRouter } from "next/navigation";
import { removePermissionFromRole } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";
import { RoleType } from "@/features/role";
import { Button, Modal } from "@mantine/core";
import { z } from "zod";
import { RolePermissionSchema } from "@/app/(authenticated)/admin/roles/schema";
import Form, { FormResponse } from "@/components/Form";
import { useState } from "react";

export function RemovePermissionFromRoleForm(props: {
  action: (data: z.infer<typeof RolePermissionSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  permission: string;
  role: string;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={z.any()}
      submitLabel={"Remove"}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Remove Permission</h1>
      <h2 className={"mb-2 mt-0 text-2xl font-bold"}>
        Are you sure you want to remove {props.permission} from {props.role}?
        <br />
        Unintended consequences can occur.
      </h2>
    </Form>
  );
}

export function PermissionRow({
  permission,
  role,
  key,
}: {
  permission: string;
  role: RoleType;
  key: string;
}) {
  const router = useRouter();

  const [isRemoveOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <li
          key={key}
          className={`divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
          style={{height: "40px"}}
      >
        {/*<a onClick={() => router.push(`/admin/permissions/${permission}`)}>*/}
          {permission}{/*}</a>*/}    -&nbsp;
          <Button variant="danger" onClick={() => setRemoveOpen(true)}>
            Remove {permission}
          </Button>
          <Modal
              opened={isRemoveOpen}
              onClose={() => setRemoveOpen(false)}
              size={"95%"}
          >
            <RemovePermissionFromRoleForm
                action={async () => removePermissionFromRole(role.role_id, permission)}
                onSuccess={() => router.push(`/admin/roles/` + role.role_id)}
                permission={permission}
                role={role.name}
            />
            <br/>
          </Modal>
      </li>
    </>
);
}
