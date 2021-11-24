export type FieldErrors = Record<string, string>;

export type ValidationResult<DataType> =
  | { data: DataType }
  | { error: FieldErrors };

export type ValidateFieldResult = { error?: string };

export type Validator<DataType> = {
  validateAll: (formData: FormData) => ValidationResult<DataType>;
  validateField: (values: any, field: string) => ValidateFieldResult;
};
