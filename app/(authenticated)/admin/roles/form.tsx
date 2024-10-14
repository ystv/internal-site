import Form, {
  FormResponse,
  PermissionSelectField,
  TextAreaField,
  TextField,
} from "@/components/forms";
import { RoleWithPermissions } from "@/features/people";
import { Permission } from "@/lib/auth/permissions";
import { Space } from "@mantine/core";
import { z } from "zod";
import { createRoleSchema, updateRoleSchema } from "./schema";

export function CreateRoleForm(props: {
  action: (data: z.infer<typeof createRoleSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  initialValues?: z.infer<typeof createRoleSchema>;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={createRoleSchema}
      initialValues={props.initialValues}
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
      <Space h={"md"} />
      <PermissionSelectField name="permissions" label="Permissions" />
    </Form>
  );
}

export function UpdateRoleForm(props: {
  action: (data: z.infer<typeof updateRoleSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  selectedRole?: RoleWithPermissions;
}) {
  if (!props.selectedRole) {
    return <>No Role Selected.</>;
  }

  const formSafeRole = {
    ...props.selectedRole,
    role_permissions: undefined,
    permissions: props.selectedRole.role_permissions.map(
      (v) => v.permission as Permission,
    ),
  };

  return (
    <Form
      action={(data) => {
        if (!props.selectedRole) {
          throw new Error("No selected role");
        }
        return props.action({
          role_id: props.selectedRole.role_id,
          ...data,
        });
      }}
      onSuccess={props.onSuccess}
      schema={updateRoleSchema.omit({ role_id: true })}
      initialValues={formSafeRole}
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
      <Space h={"md"} />
      <PermissionSelectField name="permissions" label="Permissions" />
    </Form>
  );
}
