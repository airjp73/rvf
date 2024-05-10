import {
  DataFunctionArgs,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "@remix-run/server-runtime";
import { withZod } from "@rvf/zod";
import { validationError, ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const baseSchema = z.object({
  description: zfd.text(),
});

const clientValidator = withZod(
  baseSchema.and(
    z.object({
      myFile: zfd.file(
        z.instanceof(File, {
          message: "Please choose a file",
        }),
      ),
    }),
  ),
);

const serverValidator = withZod(
  baseSchema.and(
    z.object({
      myFile: zfd.file(z.string()),
    }),
  ),
);

const testUploadHandler = unstable_composeUploadHandlers(async ({ name }) => {
  if (name !== "myFile") {
    return;
  }

  return "testFile";
}, unstable_createMemoryUploadHandler());

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await serverValidator.validate(
    await unstable_parseMultipartFormData(request, testUploadHandler),
  );
  if (result.error) return validationError(result.error);
  const { myFile, description } = result.data;

  return json({
    message: `Uploaded ${myFile} with description ${description}`,
  });
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <ValidatedForm
      validator={clientValidator}
      method="post"
      encType="multipart/form-data"
    >
      {actionData && "message" in actionData && <h1>{actionData.message}</h1>}
      <Input name="myFile" label="My File" type="file" />
      <Input name="description" label="Description" />
      <SubmitButton />
    </ValidatedForm>
  );
}
