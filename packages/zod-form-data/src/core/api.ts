import * as core from "@zod/core";
import * as schemas from "./schemas";

export const _formData = <Shape extends core.$ZodShape>(
  Class: core.util.SchemaClass<schemas.$ZfdFormData<Shape>>,
  shape: Shape,
  params?: string | schemas.$ZfdFormDataParams,
): schemas.$ZfdFormData<Shape> => {
  const def: core.$ZodObjectLikeDef = {
    type: "object",
    shape,
    get optional() {
      return core.util.optionalObjectKeys(shape);
    },
    ...core.util.normalizeParams(params),
  };
  return new Class(def);
};

export const _text = (
  Class: core.util.SchemaClass<schemas.$ZfdTextInput>,
  params?: schemas.$ZfdTextInputParams | string,
): schemas.$ZfdTextInput => {
  return new Class({
    type: "string",
    ...core.util.normalizeParams(params),
  });
};

export interface $ZfdCheckboxParams<TrueValue extends string = "on">
  extends core.$ZodBooleanParams {
  trueValue: TrueValue;
}
export const _checkbox = <TrueValue extends string = "on">(
  Class: core.util.SchemaClass<schemas.$ZfdCheckbox<TrueValue>>,
  params?: $ZfdCheckboxParams<TrueValue>,
): schemas.$ZfdCheckbox<TrueValue> => {
  return new Class({
    type: "boolean",
    zfdTrueValue: (params?.trueValue as any) ?? "on",
    ...core.util.normalizeParams(params),
  });
};
