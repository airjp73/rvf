import { FormScope } from "./form";
import { FieldValue } from "./type-helpers";

describe("FieldValue", () => {
  it("should work with a single field", () => {
    type TestForm = FormScope<{ foo: string }>;
    type Foo = FieldValue<TestForm, "foo">;
    expectTypeOf<Foo>().toEqualTypeOf<string>();
  });
});
