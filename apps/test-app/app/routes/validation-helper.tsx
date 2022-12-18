import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { useState } from "react";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";

const validator = withZod(
  z.object({
    isValid: zfd.checkbox().refine((val) => !!val, "Must be checked"),
  })
);

export const action = async (args: DataFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return json({ message: "Submitted!" });
};

export default function FrontendValidation() {
  const { submit, validate } = useFormContext("test-form");

  const data = useActionData<typeof action>();
  const [message, setMessage] = useState("");

  useEffect(() => setMessage(data?.message || ""), [data?.message]);

  return (
    <>
      {message && <h1>{message}</h1>}
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input type="checkbox" name="isValid" label="isValid" />
        <button
          type="button"
          onClick={async () => {
            const result = await validate();
            if (result.error) {
              setMessage("Invalid");
              return;
            }
            setMessage("");
            submit();
          }}
        >
          Submit with helper
        </button>
      </ValidatedForm>
    </>
  );
}
