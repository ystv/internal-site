import Form, { TextField, type FormResponse } from "@/components/forms";
import type { User } from "@prisma/client";
import type { z } from "zod";
import { editUserSchema } from "./schema";

export function EditUserForm(props: {
  user: User;
  action: (data: z.infer<typeof editUserSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form
      action={props.action}
      schema={editUserSchema}
      initialValues={{
        user_id: props.user.user_id,
        first_name: props.user.first_name,
        nickname: props.user.nickname,
        last_name: props.user.last_name,
      }}
      onSuccess={props.onSuccess}
    >
      <TextField name="first_name" label="First Name" required />
      <TextField name="nickname" label="Nickname" />
      <TextField name="last_name" label="Last Name" required />
    </Form>
  );
}
