import { ValueOfInputType } from "./input-types";

it("should give specific types for inputs with special handling", () => {
  expectTypeOf<ValueOfInputType<"text">>().toEqualTypeOf<string>();
  expectTypeOf<ValueOfInputType<"number">>().toEqualTypeOf<number | null>();
  expectTypeOf<ValueOfInputType<"checkbox">>().toEqualTypeOf<
    boolean | string | string[]
  >();
  expectTypeOf<ValueOfInputType<"radio">>().toEqualTypeOf<string>();
  expectTypeOf<ValueOfInputType<"file">>().toEqualTypeOf<
    File | File[] | null
  >();
});

it("should just return string for every other type", () => {
  expectTypeOf<ValueOfInputType<"jim">>().toEqualTypeOf<string>();
  expectTypeOf<ValueOfInputType<"date">>().toEqualTypeOf<string>();
  expectTypeOf<ValueOfInputType<"tel">>().toEqualTypeOf<string>();
  expectTypeOf<ValueOfInputType<"password">>().toEqualTypeOf<string>();
});

it("should work with custom mappings", () => {
  type MyInputs = {
    myText: "foo";
    myNumber: number;
    myCheckbox: boolean;
  };

  expectTypeOf<ValueOfInputType<"myText", MyInputs>>().toEqualTypeOf<"foo">();
  expectTypeOf<
    ValueOfInputType<"myNumber", MyInputs>
  >().toEqualTypeOf<number>();
  expectTypeOf<
    ValueOfInputType<"myCheckbox", MyInputs>
  >().toEqualTypeOf<boolean>();
  expectTypeOf<ValueOfInputType<"myRadio", MyInputs>>().toEqualTypeOf<string>();
  expectTypeOf<ValueOfInputType<"myFile", MyInputs>>().toEqualTypeOf<string>();
});
