export type FieldErrors = Record<string, string>;

export type GenericObject = { [key: string]: any };

export type ValidationResult<DataType> =
  | { data: DataType; error: undefined }
  | { error: FieldErrors; data: undefined };

export type ValidateFieldResult = { error?: string };

export type Validator<DataType> = {
  validate: (unvalidatedData: GenericObject) => ValidationResult<DataType>;
  validateField: (
    unvalidatedData: GenericObject,
    field: string
  ) => ValidateFieldResult;
};
