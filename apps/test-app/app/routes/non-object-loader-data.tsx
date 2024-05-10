import { json, DataFunctionArgs } from "@remix-run/node";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "remix-validated-form";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(),
  }),
);

export type LoaderData = string;

export const loader = (args: DataFunctionArgs) =>
  json<LoaderData>("Hello, world");

export default function FrontendValidation() {
  return (
    <>
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input name="text1" type="text" label="Text" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
