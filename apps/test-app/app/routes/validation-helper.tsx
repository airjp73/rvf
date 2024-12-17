import { DataFunctionArgs, json } from "react-router";
import { useActionData } from "react-router";
import { withZod } from "@rvf/zod";
import { useEffect } from "react";
import { useState } from "react";
import { FormProvider, ValidatedForm, useForm } from "@rvf/remix";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";

const validator = withZod(
  z.object({
    isValid: zfd.checkbox().refine((val) => !!val, "Must be checked"),
  }),
);

export const action = async (args: DataFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return json({ message: "Submitted!" });
};

export default function FrontendValidation() {
  const { submit, validate, getFormProps, scope } = useForm({
    validator,
    method: "post",
    id: "test-form",
  });

  const data = useActionData<typeof action>();
  const [message, setMessage] = useState("");

  useEffect(() => setMessage(data?.message || ""), [data?.message]);

  return (
    <FormProvider scope={scope()}>
      {message && <h1>{message}</h1>}
      <form {...getFormProps()}>
        <Input type="checkbox" name="isValid" label="isValid" />
        <button
          type="button"
          onClick={async () => {
            const result = await validate();
            if (Object.keys(result).length > 0) {
              setMessage("Invalid");
              return;
            }
            setMessage("");
            submit();
          }}
        >
          Submit with helper
        </button>
      </form>
    </FormProvider>
  );
}
