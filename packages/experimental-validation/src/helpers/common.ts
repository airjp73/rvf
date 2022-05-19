import { AnySchema } from "../core";

export const commonMethods = {
  /**
   * Sets the label of the schema.
   * All default validation error messages will use this label.
   *
   * @param label - The label to use
   * @returns A new schema with this label.
   */
  label<Self extends AnySchema>(this: Self, label: string) {
    return this.withMeta({ label });
  },
};
