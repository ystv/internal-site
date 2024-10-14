"use client";

import Form, {
  HiddenField,
  SelectField,
  TextAreaField,
  type FormResponse,
} from "@/components/forms";
import { notifications } from "@mantine/notifications";
import { identity } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { UserReportSchema } from "./schema";

export function UserReportForm({
  action,
}: {
  action: (data: unknown) => Promise<FormResponse>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  return (
    <>
      <Form
        schema={UserReportSchema}
        action={action}
        onSuccess={() => {
          router.push(decodeURIComponent(searchParams.get("return_to") ?? "/"));
          notifications.show({
            title: "Success",
            message:
              "Thank you! Your report has been received by the Computing Team.",
            color: "green",
          });
        }}
      >
        <SelectField
          name="type"
          label="What are you reporting?"
          options={["bug", "feature"]}
          getOptionValue={identity}
          filter={() => true}
          renderOption={(option) =>
            option === "bug"
              ? "Something's not working right"
              : "I'd like to request a feature"
          }
        />
        <TextAreaField
          name="description"
          label="Describe the issue or feature"
        />
        <HiddenField
          name="path"
          value={decodeURIComponent(searchParams.get("return_to") ?? "?")}
        ></HiddenField>
      </Form>
    </>
  );
}
