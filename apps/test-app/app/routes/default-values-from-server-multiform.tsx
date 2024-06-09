import { json, DataFunctionArgs } from "@remix-run/node";
import { withZod } from "@rvf/zod";
import {
  ValidatedForm,
  ValidatorData,
  setFormDefaults,
  FormDefaults,
} from "@rvf/remix";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(),
  }),
);

export type LoaderData = {
  message: string;
};

export const loader = (args: DataFunctionArgs) =>
  json<LoaderData & FormDefaults>({
    message: "hi",
    ...setFormDefaults<ValidatorData<typeof validator>>("test-form", {
      text1: "John",
    }),
    ...setFormDefaults<ValidatorData<typeof validator>>("test-form-2", {
      text1: "Bob",
    }),
  });

export default function FrontendValidation() {
  return (
    <>
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input name="text1" type="text" label="Text" data-testid="form1input" />
        <SubmitButton />
      </ValidatedForm>
      <ValidatedForm validator={validator} method="post" id="test-form-2">
        <Input
          name="text1"
          type="text"
          label="Other Text"
          data-testid="form2input"
        />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
