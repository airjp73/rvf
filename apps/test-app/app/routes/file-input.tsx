import { withZod } from "@remix-validated-form/with-zod";
import {
  ActionFunction,
  useActionData,
  unstable_parseMultipartFormData,
  UploadHandler,
} from "remix";
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
        })
      ),
    })
  )
);

const serverValidator = withZod(
  baseSchema.and(
    z.object({
      myFile: zfd.file(z.string()),
    })
  )
);

const testUploadHandler: UploadHandler = async ({ name }) => {
  if (name !== "myFile") {
    return;
  }

  return "testFile";
};

export const action: ActionFunction = async ({ request }) => {
  const result = await serverValidator.validate(
    await unstable_parseMultipartFormData(request, testUploadHandler)
  );
  if (result.error) return validationError(result.error);
  const { myFile, description } = result.data;

  return { message: `Uploaded ${myFile} with description ${description}` };
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm
      validator={clientValidator}
      method="post"
      encType="multipart/form-data"
    >
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="myFile" label="My File" type="file" />
      <Input name="description" label="Description" />
      <SubmitButton />
    </ValidatedForm>
  );
}
