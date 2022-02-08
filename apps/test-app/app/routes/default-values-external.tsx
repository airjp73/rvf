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
    likesColors: zfd.repeatable(),
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
          hideErrors
        />
        <Input
          name="radio"
          type="radio"
          form="test-form"
          label="Value 2"
          value="value2"
          data-testid="value2"
          hideErrors
        />
        <Input
          name="radio"
          type="radio"
          form="test-form"
          label="Value 3"
          value="value3"
          data-testid="value3"
          hideErrors
        />
      </Fieldset>
      <Fieldset
        label="Which colors do you like"
        name="likesColors"
        form="test-form"
      >
        <Input
          data-testid="red"
          name="likesColors"
          type="checkbox"
          label="Red"
          value="red"
          hideErrors
          form="test-form"
        />
        <Input
          data-testid="blue"
          name="likesColors"
          type="checkbox"
          label="Blue"
          value="blue"
          hideErrors
          form="test-form"
        />
        <Input
          data-testid="green"
          name="likesColors"
          type="checkbox"
          label="Green"
          value="green"
          hideErrors
          form="test-form"
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
          likesColors: ["red", "green"],
        }}
      >
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
