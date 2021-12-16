import * as yup from "yup";
import { z } from "zod";
import { Validator, withYup } from "..";
import { objectFromPathEntries } from "../internal/flatten";
import { TestFormData } from "../test-data/testFormData";
import { withZod } from "./withZod";

// If adding an adapter, write a validator that validates this shape
type Person = {
  firstName: string;
  lastName: string;
  age?: number;
  address: {
    streetAddress: string;
    city: string;
    country: string;
  };
  pets?: {
    animal: string;
    name: string;
  }[];
};

type ValidationTestCase = {
  name: string;
  validator: Validator<Person>;
};

const validationTestCases: ValidationTestCase[] = [
  {
    name: "yup",
    validator: withYup(
      yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        age: yup.number(),
        address: yup
          .object({
            streetAddress: yup.string().required(),
            city: yup.string().required(),
            country: yup.string().required(),
          })
          .required(),
        pets: yup.array().of(
          yup.object({
            animal: yup.string().required(),
            name: yup.string().required(),
          })
        ),
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
        address: z.preprocess(
          (value) => (value == null ? {} : value),
          z.object({
            streetAddress: z.string().nonempty(),
            city: z.string().nonempty(),
            country: z.string().nonempty(),
          })
        ),
        pets: z
          .object({
            animal: z.string().nonempty(),
            name: z.string().nonempty(),
          })
          .array()
          .optional(),
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
        const person: Person = {
          firstName: "John",
          lastName: "Doe",
          age: 30,
          address: {
            streetAddress: "123 Main St",
            city: "Anytown",
            country: "USA",
          },
          pets: [{ animal: "dog", name: "Fido" }],
        };
        expect(validator.validate(person)).toEqual({
          data: person,
          error: undefined,
        });
      });

      it("should return field errors when invalid", () => {
        const obj = { age: "hi!", pets: [{ animal: "dog" }] };
        expect(validator.validate(obj)).toEqual({
          data: undefined,
          error: {
            firstName: anyString,
            lastName: anyString,
            age: anyString,
            "address.city": anyString,
            "address.country": anyString,
            "address.streetAddress": anyString,
            "pets[0].name": anyString,
            _submittedData: obj,
          },
        });
      });

      it("should unflatten data when validating", () => {
        const data = {
          firstName: "John",
          lastName: "Doe",
          age: 30,
          "address.streetAddress": "123 Main St",
          "address.city": "Anytown",
          "address.country": "USA",
          "pets[0].animal": "dog",
          "pets[0].name": "Fido",
        };
        expect(validator.validate(data)).toEqual({
          data: {
            firstName: "John",
            lastName: "Doe",
            age: 30,
            address: {
              streetAddress: "123 Main St",
              city: "Anytown",
              country: "USA",
            },
            pets: [{ animal: "dog", name: "Fido" }],
          },
          error: undefined,
        });
      });

      it("should accept FormData directly and return errors", () => {
        const formData = new TestFormData();
        formData.set("firstName", "John");
        formData.set("lastName", "Doe");
        formData.set("address.streetAddress", "123 Main St");
        formData.set("address.country", "USA");
        formData.set("pets[0].animal", "dog");

        expect(validator.validate(formData)).toEqual({
          data: undefined,
          error: {
            "address.city": anyString,
            "pets[0].name": anyString,
            _submittedData: objectFromPathEntries([...formData.entries()]),
          },
        });
      });

      it("should accept FormData directly and return valid data", () => {
        const formData = new TestFormData();
        formData.set("firstName", "John");
        formData.set("lastName", "Doe");
        formData.set("address.streetAddress", "123 Main St");
        formData.set("address.country", "USA");
        formData.set("address.city", "Anytown");
        formData.set("pets[0].animal", "dog");
        formData.set("pets[0].name", "Fido");

        expect(validator.validate(formData)).toEqual({
          data: {
            firstName: "John",
            lastName: "Doe",
            address: {
              streetAddress: "123 Main St",
              country: "USA",
              city: "Anytown",
            },
            pets: [{ animal: "dog", name: "Fido" }],
          },
          error: undefined,
        });
      });
    });

    describe("validateField", () => {
      it("should not return an error if field is valid", () => {
        const person = {
          firstName: "John",
          lastName: {}, // invalid, but we should only be validating firstName
        };
        expect(validator.validateField(person, "firstName")).toEqual({
          error: undefined,
        });
      });
      it("should not return an error if a nested field is valid", () => {
        const person = {
          firstName: "John",
          lastName: {}, // invalid, but we should only be validating firstName
          address: {
            streetAddress: "123 Main St",
            city: "Anytown",
            country: "USA",
          },
          pets: [{ animal: "dog", name: "Fido" }],
        };
        expect(
          validator.validateField(person, "address.streetAddress")
        ).toEqual({
          error: undefined,
        });
        expect(validator.validateField(person, "address.city")).toEqual({
          error: undefined,
        });
        expect(validator.validateField(person, "address.country")).toEqual({
          error: undefined,
        });
        expect(validator.validateField(person, "pets[0].animal")).toEqual({
          error: undefined,
        });
        expect(validator.validateField(person, "pets[0].name")).toEqual({
          error: undefined,
        });
      });

      it("should return an error if field is invalid", () => {
        const person = {
          firstName: "John",
          lastName: {},
          address: {
            streetAddress: "123 Main St",
            city: 1234,
          },
        };
        expect(validator.validateField(person, "lastName")).toEqual({
          error: anyString,
        });
      });

      it("should return an error if a nested field is invalid", () => {
        const person = {
          firstName: "John",
          lastName: {},
          address: {
            streetAddress: "123 Main St",
            city: 1234,
          },
          pets: [{ animal: "dog" }],
        };
        expect(validator.validateField(person, "address.country")).toEqual({
          error: anyString,
        });
        expect(validator.validateField(person, "pets[0].name")).toEqual({
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
        _submittedData: obj,
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
        _submittedData: obj,
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
