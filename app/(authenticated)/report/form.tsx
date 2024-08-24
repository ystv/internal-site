"use client";

import Form, { FormResponse } from "@/components/Form";
import { UserReportSchema } from "./schema";
import { SelectField, TextAreaField } from "@/components/FormFields";
import { identity } from "lodash";
import { useState } from "react";
import { Alert } from "@mantine/core";

export function UserReportForm({
  action,
}: {
  action: (data: unknown) => Promise<FormResponse>;
}) {
  const [success, setSuccess] = useState(false);
  return (
    <>
      <Form
        schema={UserReportSchema}
        action={action}
        onSuccess={() => setSuccess(true)}
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
      </Form>
      {success && (
        <Alert variant="filled" color="green">
          Thank you! Your report has been received by the Computing Team.
        </Alert>
      )}
    </>
  );
}
