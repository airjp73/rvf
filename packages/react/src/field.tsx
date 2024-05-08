import { FormStoreValue, Rvf } from "@rvf/core";

export interface RvfField<FormInputData> {}

export type FieldImplParams<FormInputData> = {
  form: Rvf<FormInputData>;
  fieldName: string;
  trackedState: FormStoreValue;
};

export const makeFieldImpl = <FormInputData,>({
  form,
  fieldName,
  trackedState,
}: FieldImplParams<FormInputData>): RvfField<FormInputData> => {
  return {};
};
