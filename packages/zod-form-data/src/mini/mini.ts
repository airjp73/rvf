import * as core from "@zod/core";
import * as zm from "@zod/mini";
import * as api from "../core/api";
import * as schemas from "../core/schemas";

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
): ZfdMiniTextInput<string> {
  return api._text(ZfdMiniTextInput, params) as any;
}
