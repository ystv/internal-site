import Form, { FormResponse } from "@/components/Form";
// import { createUserSchema, updateUserSchema } from "./schema";
import { z } from "zod";
import { TextAreaField, TextField } from "@/components/FormFields";
import { User } from "@prisma/client";
import { notifications } from "@mantine/notifications";

// export function CreateUserForm(props: {
//   action: (data: z.infer<typeof createUserSchema>) => Promise<FormResponse>;
//   onSuccess: () => void;
// }) {
//   return (
//     <Form
//       action={props.action}
//       onSuccess={props.onSuccess}
//       schema={createUserSchema}
//     >
//       <TextField name="name" label="Name" required />
//       <TextAreaField
//         name="brief_description"
//         label="Brief Description"
//         autosize
//         minRows={1}
//       />
//       <TextAreaField
//         name="full_description"
//         label="Full Description"
//         autosize
//       />
//     </Form>
//   );
// }

// export function UpdateUserForm(props: {
//   action: (data: z.infer<typeof updateUserSchema>) => Promise<FormResponse>;
//   onSuccess: () => void;
//   selectedUser: User | undefined;
// }) {
//   return (
//     <Form
//       action={(data) => {
//         if (!props.selectedUser) {
//           throw new Error("No selected position");
//         }
//         return props.action({
//           position_id: props.selectedUser.position_id,
//           ...data,
//         });
//       }}
//       onSuccess={() => {
//         notifications.show({
//           message: `Successfully updated "${props.selectedUser?.name}"`,
//           color: "green",
//         });
//         props.onSuccess();
//       }}
//       schema={updateUserSchema.omit({ position_id: true })}
//       initialValues={{
//         name: props.selectedUser?.name,
//         brief_description: props.selectedUser?.brief_description,
//         full_description: props.selectedUser?.full_description,
//       }}
//     >
//       <TextField name="name" label="Name" required />
//       <TextAreaField
//         name="brief_description"
//         label="Brief Description"
//         autosize
//         minRows={1}
//       />
//       <TextAreaField
//         name="full_description"
//         label="Full Description"
//         autosize
//       />
//     </Form>
//   );
// }
