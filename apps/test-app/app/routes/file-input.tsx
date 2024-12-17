import { unstable_parseMultipartFormData, json } from "react-router";
import { useActionData } from "react-router";
import {
  ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "react-router";
import { withZod } from "@rvf/zod";
import {
  validationError,
  ValidatedForm,
} from "../../../../packages/react-router/dist";
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

export const action = async ({ request }: ActionFunctionArgs) => {
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
