"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";
import { z } from "zod";
import Form, { FormResponse } from "@/components/Form";
import { TextAreaField, TextField } from "@/components/FormFields";
import { addRole } from "./rolesActions";
import { RoleSchema } from "@/app/(authenticated)/admin/roles/schema";

export function AddRoleForm(props: {
  action: (data: z.infer<typeof RoleSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form action={props.action} onSuccess={props.onSuccess} schema={RoleSchema}>
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Add Role</h1>
      <TextField name="name" label="Name" required placeholder={"New Role"} />
      <TextAreaField name="description" label="Description" />
    </Form>
  );
}

export function AddRoleView() {
  const [isAddOpen, setAddOpen] = useState(false);
  return (
    <>
      <div className={"mx-auto text-right"}>
        <Button onClick={() => setAddOpen(true)}>Add Role</Button>
        <br />
      </div>
      <Modal opened={isAddOpen} onClose={() => setAddOpen(false)} size={"95%"}>
        <AddRoleForm
          action={async (form) => addRole(form)}
          onSuccess={() => setAddOpen(false)}
        />
        <br />
      </Modal>
    </>
  );
}
