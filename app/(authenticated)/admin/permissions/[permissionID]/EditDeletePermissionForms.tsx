"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";
import { z } from "zod";
import Form, { FormResponse } from "@/components/Form";
import { TextAreaField, TextField } from "@/components/FormFields";
import { editPermission, deletePermission } from "./permissionsActions";
import { PermissionSchema } from "@/app/(authenticated)/admin/permissions/schema";
import { PermissionType } from "@/features/permission";
import { useRouter } from "next/navigation";

export function EditPermissionForm(props: {
  action: (data: z.infer<typeof PermissionSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  permission: PermissionType;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={PermissionSchema}
      submitLabel={"Edit"}
      initialValues={{
        name: props.permission.name,
        description: props.permission.description?.toString(),
      }}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Edit Permission</h1>
      <TextField name="name" label="Name" required />
      <TextAreaField name="description" label="Description" />
    </Form>
  );
}

export function DeletePermissionForm(props: {
  action: (data: z.infer<typeof PermissionSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={z.any()}
      submitLabel={"Delete"}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Delete Permission</h1>
      <h2 className={"mb-2 mt-0 text-2xl font-bold"}>
        Are you sure you want to delete this?
        <br />
        Unintended consequences can occur.
      </h2>
    </Form>
  );
}

export function PermissionViews({
  permission,
}: {
  permission: PermissionType;
}) {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <div className={"mx-auto text-right"}>
        <Button variant="warning" onClick={() => setEditOpen(true)}>
          Edit Permission
        </Button>
        <br />
      </div>
      <div className={"mx-auto text-right"}>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete Permission
        </Button>
        <br />
      </div>
      <Modal
        opened={isEditOpen}
        onClose={() => setEditOpen(false)}
        size={"95%"}
      >
        <EditPermissionForm
          action={async (form) =>
            editPermission(permission.permission_id, form)
          }
          onSuccess={() => setEditOpen(false)}
          permission={permission}
        />
        <br />
      </Modal>
      <Modal
        opened={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        size={"95%"}
      >
        <DeletePermissionForm
          action={async () => deletePermission(permission.permission_id)}
          onSuccess={() => router.push(`/admin/permissions`)}
        />
        <br />
      </Modal>
    </>
  );
}
