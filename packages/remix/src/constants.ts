export const FORM_ID_FIELD_NAME = "__internal_rvf_form_id__";
export const formDefaultValuesKey = (formId: string) =>
  `__internal_rvf_defaults__${formId}`;

export type FormDefaultsKey = `__internal_rvf_defaults__${string}`;
