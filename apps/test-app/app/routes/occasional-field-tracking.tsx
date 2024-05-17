import { withZod } from "@rvf/zod";
import { useEffect } from "react";
import { ValidatedForm, useControlField, useRvf } from "@rvf/remix";
import { z } from "zod";
import { zfd } from "zod-form-data";

const validator = withZod(
  z.object({
    token: zfd.text(),
  }),
);

export default function OccasionalFieldTracking() {
  const form = useRvf({
    validator,
    method: "post",
    defaultValues: {
      token: "",
    },
    formId: "form",
  });

  useEffect(() => {
    form.setValue("token", "set-on-mount");
  }, [form]);

  return (
    <form {...form.getFormProps()}>
      <input
        data-testid="occasional"
        name="token"
        {...form.field("token").getInputProps()}
      />
    </form>
  );
}
