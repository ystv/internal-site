"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";
import { z } from "zod";
import Form, { FormResponse } from "@/components/Form";
import { TextAreaField, TextField } from "@/components/FormFields";
import { editRole, deleteRole } from "./rolesActions";
import { RoleSchema } from "@/app/(authenticated)/admin/roles/schema";
import { RoleType } from "@/features/role";
import { useRouter } from "next/navigation";

export function EditRoleForm(props: {
  action: (data: z.infer<typeof RoleSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  role: RoleType;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={RoleSchema}
      submitLabel={"Edit"}
      initialValues={{
        name: props.role.name,
        description: props.role.description?.toString(),
      }}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Edit Role</h1>
      <TextField name="name" label="Name" required />
      <TextAreaField name="description" label="Description" />
    </Form>
  );
}

export function DeleteRoleForm(props: {
  action: (data: z.infer<typeof RoleSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={z.any()}
      submitLabel={"Delete"}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Delete Role</h1>
      <h2 className={"mb-2 mt-0 text-2xl font-bold"}>
        Are you sure you want to delete this?
        <br />
        Unintended consequences can occur.
      </h2>
    </Form>
  );
}

export function RoleViews({ role }: { role: RoleType }) {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <div className={"mx-auto text-right"}>
        <Button variant="warning" onClick={() => setEditOpen(true)}>
          Edit Role
        </Button>
        <br />
      </div>
      <div className={"mx-auto text-right"}>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete Role
        </Button>
        <br />
      </div>
      <Modal
        opened={isEditOpen}
        onClose={() => setEditOpen(false)}
        size={"95%"}
      >
        <EditRoleForm
          action={async (form) => editRole(role.role_id, form)}
          onSuccess={() => setEditOpen(false)}
          role={role}
        />
        <br />
      </Modal>
      <Modal
        opened={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        size={"95%"}
      >
        <DeleteRoleForm
          action={async () => deleteRole(role.role_id)}
          onSuccess={() => router.push(`/admin/roles`)}
        />
        <br />
      </Modal>
    </>
  );
}
