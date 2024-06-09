import { withZod } from "@rvf/zod";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { FormProvider, useForm } from "@rvf/remix";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(
      z.string({
        required_error: "Text 1 is a required field",
      }),
    ),
    text2: zfd.text(),
  }),
);

export default function FrontendValidation() {
  const form = useForm({
    validator,
    method: "post",
  });

  return (
    <FormProvider scope={form.scope()}>
      <Input name="text1" type="text" form="test-form" label="Text 1" />
      <form {...form.getFormProps()}>
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </form>
    </FormProvider>
  );
}
