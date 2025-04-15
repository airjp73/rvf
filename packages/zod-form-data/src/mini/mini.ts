import * as core from "@zod/core";
import * as zm from "@zod/mini";
import * as api from "../core/api";
import * as schemas from "../core/schemas";

export interface ZfdMiniFormData<Shape extends core.$ZodShape = core.$ZodShape>
  extends zm.ZodMiniType {
  _zod: schemas.$ZfdFormDataInternals<Shape>;
}

export const ZfdMiniFormData: core.$constructor<ZfdMiniFormData> =
  core.$constructor("ZfdMiniFormData", (inst, def) => {
    schemas.$ZfdFormData.init(inst, def);
    // @ts-expect-error
    zm.ZodMiniType.init(inst, def);
  });

export function formData<Shape extends core.$ZodShape>(
  shape: Shape,
  params?: string | schemas.$ZfdFormDataParams,
): ZfdMiniFormData {
  return api._formData(ZfdMiniFormData, shape, params) as any;
}

export interface ZfdMiniTextInput<Input = unknown> extends zm.ZodMiniType {
  _zod: schemas.$ZfdTextInputInternals<Input>;
}

export const ZfdMiniTextInput: core.$constructor<ZfdMiniTextInput> =
  core.$constructor("ZfdMiniTextInput", (inst, def) => {
    schemas.$ZfdTextInput.init(inst, def);
    // @ts-expect-error
    zm.ZodMiniType.init(inst, def);
  });

export function text(
  params?: string | schemas.$ZfdTextInputParams,
): ZfdMiniTextInput {
  return api._text(ZfdMiniTextInput, params) as any;
}
