import { parseFormData, FileUpload } from "@mjackson/form-data-parser";
import { useActionData } from "react-router";
import { ActionFunctionArgs } from "react-router";
import { withZod } from "@rvf/zod";
import { validationError, ValidatedForm } from "@rvf/react-router";
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

const testUploadHandler = async (upload: FileUpload) => {
  if (upload.fieldName !== "myFile") {
    return upload.text();
  }

  return "testFile";
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await serverValidator.validate(
    await parseFormData(request, testUploadHandler),
  );
  if (result.error) return validationError(result.error);
  const { myFile, description } = result.data;

  return {
    message: `Uploaded ${myFile} with description ${description}`,
  };
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
