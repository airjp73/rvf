import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/remix";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    myRadio: z.literal("not valid ever"),
    someText: zfd.text(),
  }),
);

export default function FrontendValidation() {
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={{
        myRadio: "value2" as any,
      }}
    >
      <Input name="myRadio" type="radio" label="Value 1" value="value1" />
      <Input
        name="myRadio"
        type="radio"
        label="Value 2"
        value="value2"
        data-testid="expected"
      />
      <Input name="myRadio" type="radio" label="Value 3" value="value3" />
      <Input name="someText" type="text" label="Some text" />
      <SubmitButton />
    </ValidatedForm>
  );
}
