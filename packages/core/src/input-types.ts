/**
 * The value of a file input as managed by RVF.
 * Empty file inputs are represented by an empty string.
 */
export type SingleFileInputValue = null | File;

/**
 * The value of a file input with the `multiple` attribute as managed by RVF.
 * Empty file inputs are represented by an empty string.
 */
export type MultiFileInputValue = null | File[];

export type NumberInputValue = number | null;

export type NativeValueByType = {
  text: string;
  number: NumberInputValue;
  checkbox: boolean | string | string[];
  radio: string;
  file: null | File | File[];
};

export type ValueOfInputType<
  Type extends string,
  ValueMap extends Record<string, any> = NativeValueByType,
> = Type extends keyof ValueMap ? ValueMap[Type] : string;
