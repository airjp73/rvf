import { withZod } from "@rvf/zod";
import { useEffect } from "react";
import {
  ValidatedForm,
  useControlField,
  useForm,
} from "../../../../packages/react-router/dist";
import { z } from "zod";
import { zfd } from "zod-form-data";

const validator = withZod(
  z.object({
    token: zfd.text(),
  }),
);

export default function OccasionalFieldTracking() {
  const form = useForm({
    validator,
    method: "post",
    defaultValues: {
      token: "",
    },
  });

  useEffect(() => {
    form.setValue("token", "set-on-mount");
  }, [form]);

  return (
    <form {...form.getFormProps()}>
      <input
        data-testid="occasional"
        {...form.field("token").getInputProps()}
      />
    </form>
  );
}
