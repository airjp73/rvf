import { ValueOfInputType } from "./input-types";
import { NonContradictingSupertype } from "./types";

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

describe("NonContradictingSupertype", () => {
  it("should resolve simple, exact matches", () => {
    type Result = NonContradictingSupertype<string, string>;
    expectTypeOf<Result>().toEqualTypeOf<string>();
  });

  it("should resolve to T when U conflicts", () => {
    type Result = NonContradictingSupertype<string, number>;
    expectTypeOf<Result>().toEqualTypeOf<string>();
  });

  it("should resolve to U when U includes every type in T", () => {
    type Result = NonContradictingSupertype<
      string | number | { foo: string } | [1, 2],
      | string
      | number
      | { foo: string }
      | [1, 2]
      | [3, 4]
      | { foo: number }
      | symbol
    >;
    expectTypeOf<Result>().toEqualTypeOf<
      | string
      | number
      | { foo: string }
      | [1, 2]
      | [3, 4]
      | { foo: number }
      | symbol
    >();
  });

  it("should resolve differences inside objects", () => {
    type Result = NonContradictingSupertype<
      { foo: string; bar: number },
      { foo: string | number; bar: number | boolean }
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      foo: string | number;
      bar: number | boolean;
    }>();
  });

  it("should not allow extra properties", () => {
    type Result = NonContradictingSupertype<
      { foo: string; bar: number },
      { foo: string; bar: number; baz: string }
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      foo: string;
      bar: number;
    }>();
  });

  it("should resolve differences in tuples", () => {
    type Result = NonContradictingSupertype<
      [string, number],
      [string | number, number | boolean]
    >;
    expectTypeOf<Result>().toEqualTypeOf<[string | number, number | boolean]>();
  });

  it("should use the length of T but still resolve tuple parts against U", () => {
    type Result = NonContradictingSupertype<
      [string, number],
      [string | number, number | boolean, boolean]
    >;
    expectTypeOf<Result>().toEqualTypeOf<[string | number, number | boolean]>();

    type Result2 = NonContradictingSupertype<
      [string, number],
      [string | number]
    >;
    expectTypeOf<Result2>().toEqualTypeOf<[string | number, number]>();
  });

  it("should resolve differences that can be resolved, while returning T for conflicts", () => {
    type Result = NonContradictingSupertype<
      [string, number],
      [string | number, boolean]
    >;
    expectTypeOf<Result>().toEqualTypeOf<[string | number, number]>();
  });

  it("should resolve conflicts between tuples and arrays", () => {
    type Result = NonContradictingSupertype<
      [string, number],
      [string | number, boolean]
    >;
    expectTypeOf<Result>().toEqualTypeOf<[string | number, number]>();
  });

  it("should resolve to any if T is any", () => {
    type Result = NonContradictingSupertype<any, number>;
    expectTypeOf<Result>().toEqualTypeOf<any>();
  });

  it("should resolve to U if T is unknown", () => {
    type Result = NonContradictingSupertype<unknown, number>;
    expectTypeOf<Result>().toEqualTypeOf<number>();
  });

  it("should resolve optional fields properly", () => {
    type Result = NonContradictingSupertype<
      { foo?: string; bar?: string },
      { foo: string }
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      foo?: string;
      bar?: string;
    }>();
  });

  it("should correctly handle unions that are more specific than the schema type", () => {
    type Result1 = NonContradictingSupertype<
      { foo: string },
      { foo: "hi" | 123 }
    >;
    expectTypeOf<Result1>().toEqualTypeOf<{ foo: string | 123 }>();

    type Result2 = NonContradictingSupertype<
      { foo: { label: string; value: string } },
      { foo: { label: "foo"; value: "bar" } | null }
    >;
    expectTypeOf<Result2>().toEqualTypeOf<{
      foo: { label: string; value: string } | null;
    }>();
  });
});
