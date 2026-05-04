import { z } from "zod/mini";

type CheckboxOpts = {
  trueValue?: string;
};

/**
 * Turns the value from a checkbox field into a boolean,
 * but does not require the checkbox to be checked.
 * For checkboxes with a `value` attribute, you can pass that as the `trueValue` option.
 *
 * @example
 * ```ts
 * const schema = zfd.formData({
 *   defaultCheckbox: zfd.checkbox(),
 *   checkboxWithValue: zfd.checkbox({ trueValue: "true" }),
 *   mustBeTrue: zfd
 *     .checkbox()
 *     .refine((val) => val, "Please check this box"),
 *   });
 * });
 * ```
 */
export const checkbox = ({ trueValue = "on" }: CheckboxOpts = {}) =>
  z.union([
    z.pipe(
      z.literal(trueValue),
      z.transform(() => true),
    ),
    z.pipe(
      z.literal(undefined),
      z.transform(() => false),
    ),
    z.boolean(),
  ]);
