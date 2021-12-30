export type FieldErrors = Record<string, string>;

export type FieldErrorsWithData = FieldErrors & { _submittedData: any };

export type GenericObject = { [key: string]: any };

/**
 * The result when validating a form.
 */
export type ValidationResult<DataType> =
  | { data: DataType; error: undefined }
  | { error: FieldErrors; data: undefined };

/**
 * The result when validating an individual field in a form.
 */
export type ValidateFieldResult = { error?: string };

/**
 * A `Validator` can be passed to the `validator` prop of a `ValidatedForm`.
 */
export type Validator<DataType> = {
  validate: (unvalidatedData: GenericObject) => ValidationResult<DataType>;
  validateField: (
    unvalidatedData: GenericObject,
    field: string
  ) => ValidateFieldResult;
};

export type ValidatorData<T extends Validator<any>> = T extends Validator<
  infer U
>
  ? U
  : never;
