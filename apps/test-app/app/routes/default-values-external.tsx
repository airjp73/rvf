import { withZod } from "@remix-validated-form/with-zod";
import { useDefaultValues, ValidatedForm } from "remix-validated-form";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(),
    text2: zfd.text(),
  })
);

const Comp = ({ form }: { form?: string }) => {
  const defaultValues = useDefaultValues(form);
  return <pre>{JSON.stringify(defaultValues, null, 2)}</pre>;
};

export default function FrontendValidation() {
  return (
    <>
      <Input name="text1" type="text" form="test-form" label="Text 1" />
      <Comp form="test-form" />
      <ValidatedForm
        validator={validator}
        method="post"
        id="test-form"
        defaultValues={{
          text1: "John",
          text2: "Bob",
        }}
      >
        <Comp />
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
