import { setPath } from "@rvf/set-get";
import * as core from "@zod/core";
import z from "zod";

///////////////////////////////////////////////////
//////////////////// FormData /////////////////////
///////////////////////////////////////////////////

type FormDataLikeInput = {
  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
  entries(): IterableIterator<[string, FormDataEntryValue]>;
};

const preprocessFormData = (formData: any): Record<string, unknown> => {
  // We're avoiding using `instanceof` here because different environments
  // won't necessarily have `FormData` or `URLSearchParams`
  if (!(Symbol.iterator in formData)) return formData;
  const entries = [...formData];
  const isEntryList = entries.every(
    (item) =>
      Array.isArray(item) && item.length === 2 && typeof item[0] === "string",
  );
  if (!isEntryList) return formData;

  const map: Map<string, unknown[]> = new Map();
  for (const [key, value] of entries) {
    if (map.has(key)) {
      map.get(key)!.push(value);
    } else {
      map.set(key, [value]);
    }
  }

  return [...map.entries()].reduce(
    (acc, [key, value]) => {
      return setPath(acc, key, value.length === 1 ? value[0] : value);
    },
    {} as Record<string, unknown | unknown[]>,
  );
};

export interface $ZodFormDataInternals<
  Shape extends core.$ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends core.$ZodObjectLikeInternals<
    core.$InferObjectOutput<Shape, Extra>,
    FormData | FormDataLikeInput | core.$InferObjectInput<Shape, Extra>
  > {
  input: FormDataLikeInput;
}

export interface $ZodFormData<Shape extends core.$ZodShape = core.$ZodShape>
  extends core.$ZodType {
  _zod: $ZodFormDataInternals<Shape>;
}

export const $ZodFormData: core.$constructor<$ZodFormData> =
  core.$constructor<$ZodFormData>("$ZodFormData", (inst, def) => {
    // @ts-expect-error FIXME: Why does this give an error?
    core.$ZodObjectLike.init(inst, def);

    // IDEA: given how flexible this is, maybe we can simplify
    // the process of getting native html validation props out of this.

    // We could probably base this impl off of how zod does its wrappers like $ZodNullable.
    // https://github.com/colinhacks/zod/blob/2ade678ffc5fbe609d92537f3910f91f15d77725/packages/core/src/schemas.ts#L3040
    //
    // Since all of these are essentially preprocessors, maybe we can generalize it too?
    const oldParse = inst._zod.parse;
    inst._zod.parse = (payload, ctx) => {
      const preprocessed = preprocessFormData(payload.value);
      return oldParse({ ...payload, value: preprocessed }, ctx);
    };
  });

export const formData = <Shape extends core.$ZodShape>(
  shape: Shape,
  params?: core.$ZodObjectLikeParams,
): $ZodFormData<Shape> => {
  const def: core.$ZodObjectLikeDef = {
    type: "object",
    shape,
    get optional() {
      return core.util.optionalObjectKeys(shape);
    },
    ...core.util.normalizeParams(params),
  };
  return new $ZodFormData(def) as any;
};

///////////////////////////////////////////////////
////////////////////// Text ///////////////////////
///////////////////////////////////////////////////

export interface ZodFormDataTextInput extends core.$ZodString {}

export const ZodFormDataTextInput: core.$constructor<ZodFormDataTextInput> =
  core.$constructor("ZodFormDataTextInput", (inst, def) => {
    // @ts-expect-error
    core.$ZodString.init(inst, def);

    const defaultParse = inst._zod.parse;
    inst._zod.parse = (payload, ctx) => {
      if (payload.value === "") {
        payload.value === undefined;
      }
      return defaultParse(payload, ctx);
    };
  });

export const text = (params?: core.$ZodStringParams): ZodFormDataTextInput => {
  return new ZodFormDataTextInput({
    type: "string",
    ...core.util.normalizeParams(params),
  });
};

///////////////////////////////////////////////////
//////////////////// Optional /////////////////////
///////////////////////////////////////////////////

export interface ZodFormDataOptional<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodOptional<T> {}

export const ZodFormDataOptional: core.$constructor<ZodFormDataOptional> =
  core.$constructor("ZodFormDataOptional", (inst, def) => {
    // @ts-expect-error
    core.$ZodOptional.init(inst, def);

    const defaultParse = inst._zod.parse;
    inst._zod.parse = (payload, ctx) => {
      if (payload.value === undefined || payload.value === "") {
        payload.value = undefined;
        return payload;
      }
      return defaultParse(payload, ctx);
    };
  });

///////////////////////////////////////////////////
//////////////////// Checkbox /////////////////////
///////////////////////////////////////////////////

export interface ZodFormDataCheckboxDef<TrueValue extends string = "on">
  extends core.$ZodBooleanDef {
  zfdTrueValue: TrueValue;
}
export interface ZodFormDataCheckboxInternals<TrueValue extends string = "on">
  extends core.$ZodBooleanInternals {
  def: ZodFormDataCheckboxDef<TrueValue>;
}
export interface ZodFormDataCheckbox<TrueValue extends string = "on">
  extends core.$ZodType {
  _zod: ZodFormDataCheckboxInternals<TrueValue>;
}

export const ZodFormDataCheckbox: core.$constructor<ZodFormDataCheckbox> =
  core.$constructor("ZodFormDataCheckbox", (inst, def) => {
    // @ts-expect-error
    core.$ZodBoolean.init(inst, def);

    inst._zod.def.zfdTrueValue ??= "on";

    const defaultParse = inst._zod.parse;

    inst._zod.parse = (payload, ctx) => {
      const trueValue = inst._zod.def.zfdTrueValue;

      if (payload.value === undefined) {
        payload.value = false;
      } else if (payload.value === trueValue) {
        payload.value = true;
      } else if (typeof payload.value === "string") {
        payload.issues.push({
          code: "invalid_value",
          input: payload.value,
          inst,
          values: [trueValue, undefined],
        });
        return payload;
      }

      return defaultParse(payload, ctx);
    };
  });

export interface ZodFormDataCheckboxParams<TrueValue extends string = "on">
  extends core.$ZodBooleanParams {
  trueValue: TrueValue;
}
export const checkbox = <TrueValue extends string = "on">(
  params?: ZodFormDataCheckboxParams<TrueValue>,
): ZodFormDataCheckbox<TrueValue> => {
  return new ZodFormDataCheckbox({
    type: "boolean",
    zfdTrueValue: (params?.trueValue as any) ?? "on",
    ...core.util.normalizeParams(params),
  }) as any;
};
