import * as yup from "yup";
import { Validator, withYup } from "..";

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
        const obj = { firstName: "John", lastName: 123 };
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
