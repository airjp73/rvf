import { GenericObject } from "./native-form-data/flatten";

export type FieldValues = Record<string | number, any>;

export type SubmitStatus = "idle" | "submitting" | "error" | "success";

export type FieldErrors = Record<string, string>;
export type Valid<DataType> = { data: DataType; error: undefined };
export type Invalid = { error: FieldErrors; data: undefined };

type BaseResult = { submittedData: GenericObject; formId?: string };
export type ErrorResult = BaseResult & {
  error: ValidatorError;
  data: undefined;
};
export type SuccessResult<DataType> = BaseResult & {
  data: DataType;
  error: undefined;
};

/**
 * The result when validating a form.
 */
export type ValidationResult<DataType> = SuccessResult<DataType> | ErrorResult;

export type ValidationBehavior = "onSubmit" | "onChange" | "onBlur";

export type ValidationBehaviorConfig = {
  /**
   * When the form first mounts, when should the validation be triggered?
   */
  initial: ValidationBehavior;

  /**
   * Once a given field has been touched, when should the validation be triggered?
   */
  whenTouched: ValidationBehavior;

  /**
   * Once the form has been submitted unnsuccessfully, when should the validation be triggered?
   */
  whenSubmitted: ValidationBehavior;
};

export type FieldArrayValidationBehavior = "onSubmit" | "onChange";

export type FieldArrayValidationBehaviorConfig = {
  /**
   * When the form first mounts, when should the validation be triggered?
   */
  initial: FieldArrayValidationBehavior;

  /**
   * Once the form has been submitted unnsuccessfully, when should the validation be triggered?
   */
  whenSubmitted: FieldArrayValidationBehavior;
};

/**
 * An RVF `Validator`. Can be used by `useForm` or by calling it directly.
 */
export type Validator<DataType> = {
  validate: (
    unvalidatedData: GenericObject | FormData,
  ) => Promise<ValidationResult<DataType>>;
};

export type CreateValidatorArg<DataType> = {
  validate: (
    unvalidatedData: GenericObject,
  ) => Promise<Valid<DataType> | Invalid>;
};

export type ValidatorData<T extends Validator<any>> =
  T extends Validator<infer U> ? U : never;

export type ValidatorError = {
  formId?: string;
  fieldErrors: FieldErrors;
};

export type ValidationErrorResponseData = {
  formId?: string;
  fieldErrors: FieldErrors;
  repopulateFields?: unknown;
};

export type AllProps<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};
