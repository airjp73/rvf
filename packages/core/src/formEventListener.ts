/**
 * Listens to events that occur in the form.
 */
export interface FormEventListener {
  /**
   * Called when a field is modified via `setValue`.
   */
  onFieldSetValue?: (name: string, value: unknown) => void;

  /**
   * Called when a field is modified via `onChange`.
   */
  onFieldChange?: (name: string, value: unknown) => void;

  /**
   * Called when a field is modified via `resetField`.
   */
  onFieldReset?: (name: string, defaultValue: unknown) => void;

  /**
   * Called when the entire form is reset via `resetForm`.
   */
  onFormReset?: (nextDefaultValues: unknown) => void;

  onArrayPush?: (name: string, value: unknown) => void;
  onArrayPop?: (name: string) => void;
  onArrayShift?: (name: string) => void;
  onArrayUnshift?: (name: string, value: unknown) => void;
  onArrayInsert?: (name: string, index: number, value: unknown) => void;
  onArrayMove?: (name: string, from: number, to: number) => void;
  onArrayRemove?: (name: string, index: number) => void;
  onArraySwap?: (name: string, indexA: number, indexB: number) => void;
  onArrayReplace?: (name: string, index: number, value: unknown) => void;
}
