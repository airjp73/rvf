import { withZod } from "@rvf/zod";
import { RvfProvider, ValidatedForm, useRvf } from "@rvf/remix";
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
  }),
);

export default function FrontendValidation() {
  const rvf = useRvf({
    validator,
    method: "post",
    defaultValues: {
      text1: "John",
      text2: "Bob",
      check1: true,
      radio: "value3",
      likesColors: ["red", "green"],
    },
  });

  return (
    <RvfProvider scope={rvf.scope()}>
      <Input
        type="text"
        name={rvf.scope("text1")}
        form="test-form"
        label="Text 1"
      />
      <Input
        name={rvf.scope("check1")}
        type="checkbox"
        form="test-form"
        label="Check 1"
      />
      <Fieldset label="Radios" name="radios" rvf={rvf.scope("radio")}>
        <Input
          name={rvf.scope("radio")}
          type="radio"
          form="test-form"
          label="Value 1"
          value="value1"
          data-testid="value1"
          hideErrors
        />
        <Input
          name={rvf.scope("radio")}
          type="radio"
          form="test-form"
          label="Value 2"
          value="value2"
          data-testid="value2"
          hideErrors
        />
        <Input
          name={rvf.scope("radio")}
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
        rvf={rvf.scope("likesColors")}
      >
        <Input
          data-testid="red"
          name={rvf.scope("likesColors")}
          type="checkbox"
          label="Red"
          value="red"
          hideErrors
          form="test-form"
        />
        <Input
          data-testid="blue"
          name={rvf.scope("likesColors")}
          type="checkbox"
          label="Blue"
          value="blue"
          hideErrors
          form="test-form"
        />
        <Input
          data-testid="green"
          name={rvf.scope("likesColors")}
          type="checkbox"
          label="Green"
          value="green"
          hideErrors
          form="test-form"
        />
      </Fieldset>
      <hr />
      <form {...rvf.getFormProps()}>
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </form>
    </RvfProvider>
  );
}
