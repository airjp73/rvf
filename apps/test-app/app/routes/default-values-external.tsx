import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Fieldset } from "~/components/Fieldset";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(),
    text2: zfd.text(),
    check1: zfd.checkbox(),
    radio: z.string(),
  })
);

export default function FrontendValidation() {
  return (
    <>
      <Input name="text1" type="text" form="test-form" label="Text 1" />
      <Input name="check1" type="checkbox" form="test-form" label="Check 1" />
      <Fieldset label="Radios" name="radios" form="test-form">
        <Input
          name="radio"
          type="radio"
          form="test-form"
          label="Value 1"
          value="value1"
          data-testid="value1"
        />
        <Input
          name="radio"
          type="radio"
          form="test-form"
          label="Value 2"
          value="value2"
          data-testid="value2"
        />
        <Input
          name="radio"
          type="radio"
          form="test-form"
          label="Value 3"
          value="value3"
          data-testid="value3"
        />
      </Fieldset>
      <hr />
      <ValidatedForm
        validator={validator}
        method="post"
        id="test-form"
        defaultValues={{
          text1: "John",
          text2: "Bob",
          check1: true,
          radio: "value3",
        }}
      >
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
