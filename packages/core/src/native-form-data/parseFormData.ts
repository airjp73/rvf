import { StandardSchemaV1 } from "@standard-schema/spec";
import { withStandardSchema } from "../standardSchema";

type FormDataRequest = {
  formData: () => Promise<FormData>;
};

export const parseFormData = async <T>(
  formDataOrRequest: FormData | FormDataRequest,
  schema: StandardSchemaV1<any, T>,
) => {
  const formData =
    "formData" in formDataOrRequest &&
    typeof formDataOrRequest.formData === "function"
      ? await formDataOrRequest.formData()
      : formDataOrRequest;
  return await withStandardSchema(schema).validate(formData);
};
