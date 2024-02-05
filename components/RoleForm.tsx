import { z } from "zod";
import { RoleSchema } from "@/app/(authenticated)/admin/roles/schema";
import Form, { FormResponse } from "@/components/Form";
import { RoleType } from "@/features/role";
import { TextAreaField, TextField } from "@/components/FormFields";

export enum AddOrEdit {
  Add = "Add",
  Edit = "Edit",
}

export function AddOrEditRoleForm(props: {
  action: (data: z.infer<typeof RoleSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  role: RoleType | null;
  addOrEdit: AddOrEdit;
}) {
  let name: string = "",
    description: string = "";
  if (props.role != null) {
    name = props.role.name;
    description = props.role.description || "";
  }
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={RoleSchema}
      submitLabel={props.addOrEdit}
      initialValues={{
        name: name,
        description: description,
      }}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>
        ${props.addOrEdit} Role
      </h1>
      <TextField name="name" label="Name" required placeholder={"Role name"} />
      <TextAreaField name="description" label="Description" />
    </Form>
  );
}
