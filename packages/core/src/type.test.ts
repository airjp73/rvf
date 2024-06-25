import { NativeInputValue } from "./input-types";

it("should give specific types for inputs with special handling", () => {
  expectTypeOf<NativeInputValue<"text">>().toEqualTypeOf<string>();
  expectTypeOf<NativeInputValue<"number">>().toEqualTypeOf<number | null>();
  expectTypeOf<NativeInputValue<"checkbox">>().toEqualTypeOf<
    boolean | string | string[]
  >();
  expectTypeOf<NativeInputValue<"radio">>().toEqualTypeOf<string>();
  expectTypeOf<NativeInputValue<"file">>().toEqualTypeOf<
    File | File[] | null
  >();
});

it("should just return string for every other type", () => {
  expectTypeOf<NativeInputValue<"jim">>().toEqualTypeOf<string>();
  expectTypeOf<NativeInputValue<"date">>().toEqualTypeOf<string>();
  expectTypeOf<NativeInputValue<"tel">>().toEqualTypeOf<string>();
  expectTypeOf<NativeInputValue<"password">>().toEqualTypeOf<string>();
});
