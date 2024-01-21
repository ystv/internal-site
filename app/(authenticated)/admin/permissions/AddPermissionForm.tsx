"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";
import { z } from "zod";
import Form, { FormResponse } from "@/components/Form";
import { TextAreaField, TextField } from "@/components/FormFields";
import { addPermission } from "./permissionsActions";
import { PermissionSchema } from "@/app/(authenticated)/admin/permissions/schema";

export function AddPermissionForm(props: {
  action: (data: z.infer<typeof PermissionSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={PermissionSchema}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Add Permission</h1>
      <TextField
        name="name"
        label="Name"
        required
        placeholder={"New Permission"}
      />
      <TextAreaField name="description" label="Description" />
    </Form>
  );
}

export function AddPermissionView() {
  const [isAddOpen, setAddOpen] = useState(false);
  return (
    <>
      <div className={"mx-auto text-right"}>
        <Button onClick={() => setAddOpen(true)}>Add Permission</Button>
        <br />
      </div>
      <Modal opened={isAddOpen} onClose={() => setAddOpen(false)} size={"95%"}>
        <AddPermissionForm
          action={async (form) => addPermission(form)}
          onSuccess={() => setAddOpen(false)}
        />
        <br />
      </Modal>
    </>
  );
}
