import * as yup from "yup";
import { z } from "zod";
import { Validator, withYup } from "..";
import { withZod } from "./withZod";

// If adding an adapter, write a validator that validates this shape
type Shape = {
  firstName: string;
  lastName: string;
  age?: number;
};

type ValidationTestCase = {
  name: string;
  validator: Validator<Shape>;
};

const validationTestCases: ValidationTestCase[] = [
  {
    name: "yup",
    validator: withYup(
      yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        age: yup.number(),
      })
    ),
  },
  {
    name: "zod",
    validator: withZod(
      z.object({
        firstName: z.string().nonempty(),
        lastName: z.string().nonempty(),
        age: z.optional(z.number()),
      })
    ),
  },
];

// Not going to enforce exact error strings here
const anyString = expect.any(String);

describe("Validation", () => {
  describe.each(validationTestCases)("Adapter for $name", ({ validator }) => {
    describe("validate", () => {
      it("should return the data when valid", () => {
        const obj: Shape = {
          firstName: "John",
          lastName: "Doe",
          age: 30,
        };
        expect(validator.validate(obj)).toEqual({
          data: obj,
          error: undefined,
        });
      });

      it("should return field errors when invalid", () => {
        const obj = { age: "hi!" };
        expect(validator.validate(obj)).toEqual({
          data: undefined,
          error: {
            firstName: anyString,
            lastName: anyString,
            age: anyString,
          },
        });
      });
    });

    describe("validateField", () => {
      it("should not return an error if field is valid", () => {
        const obj = {
          firstName: "John",
          lastName: {}, // invalid, but we should only be validating firstName
        };
        expect(validator.validateField(obj, "firstName")).toEqual({
          error: undefined,
        });
      });

      it("should return an error if field is invalid", () => {
        const obj = { firstName: "John", lastName: {} };
        expect(validator.validateField(obj, "lastName")).toEqual({
          error: anyString,
        });
      });
    });
  });
});

describe("withZod", () => {
  it("returns coherent errors for complex schemas", () => {
    const schema = z.union([
      z.object({
        type: z.literal("foo"),
        foo: z.string(),
      }),
      z.object({
        type: z.literal("bar"),
        bar: z.string(),
      }),
    ]);
    const obj = {
      type: "foo",
      bar: 123,
      foo: 123,
    };

    expect(withZod(schema).validate(obj)).toEqual({
      data: undefined,
      error: {
        type: anyString,
        bar: anyString,
        foo: anyString,
      },
    });
  });

  it("returns errors for fields that are unions", () => {
    const schema = z.object({
      field1: z.union([z.literal("foo"), z.literal("bar")]),
      field2: z.union([z.literal("foo"), z.literal("bar")]),
    });
    const obj = {
      field1: "a value",
      // field2 missing
    };

    const validator = withZod(schema);
    expect(validator.validate(obj)).toEqual({
      data: undefined,
      error: {
        field1: anyString,
        field2: anyString,
      },
    });
    expect(validator.validateField(obj, "field1")).toEqual({
      error: anyString,
    });
    expect(validator.validateField(obj, "field2")).toEqual({
      error: anyString,
    });
  });
});
