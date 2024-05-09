export type FieldValues = Record<string | number, unknown>;

export type SubmitStatus = "idle" | "submitting" | "error" | "success";

export type FieldErrors = Record<string, string>;
export type Valid<DataType> = { data: DataType; error: undefined };
export type Invalid = { error: FieldErrors; data: undefined };
export type ValidationResult<DataType> = Valid<DataType> | Invalid;

export type Validator<InputData extends FieldValues, OutputData> = (
  data: InputData,
) => Promise<ValidationResult<OutputData>>;

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
