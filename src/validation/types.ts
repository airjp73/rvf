export type FieldErrors = Record<string, string>;

export type ValidationResult<DataType> =
  | { data: DataType; error: undefined }
  | { error: FieldErrors; data: undefined };

export type ValidateFieldResult = { error?: string };

export type Validator<DataType> = {
  validate: (unvalidatedData: unknown) => ValidationResult<DataType>;
  validateField: (
    unvalidatedData: unknown,
    field: string
  ) => ValidateFieldResult;
};
