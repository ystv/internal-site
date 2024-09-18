import Form, { FormResponse } from "@/components/Form";
import { User } from "@prisma/client";
import { editUserSchema } from "./schema";
import { TextField } from "@/components/FormFields";
import { z } from "zod";
import { useRouter } from "next/router";

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
      <TextField name="nickname" label="Nick Name" required />
      <TextField name="last_name" label="Last Name" required />
    </Form>
  );
}
