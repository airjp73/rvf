import { anyString, TestFormData } from "@remix-validated-form/test-utils";
import { withYup } from "@rvf/yup";
import { withValibot } from "@rvf/valibot";
import {
  Validator,
  objectFromPathEntries,
  withStandardSchema,
} from "@rvf/core";
import { describe, it, expect } from "vitest";
import * as yup from "yup";
import { z } from "zod";
import * as v from "valibot";
import { withZod } from ".";

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

const zodSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.optional(z.number()),
  address: z.preprocess(
    (value) => (value == null ? {} : value),
    z.object({
      streetAddress: z.string().min(1),
      city: z.string().min(1),
      country: z.string().min(1),
    }),
  ),
  pets: z
    .object({
      animal: z.string().min(1),
      name: z.string().min(1),
    })
    .array()
    .optional(),
});

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
          }),
        ),
      }),
    ),
  },
  {
    name: "zod",
    validator: withZod(zodSchema),
  },
  {
    name: "valibot",
    validator: withValibot(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        age: v.optional(v.number()),
        address: v.pipe(
          v.unknown(),
          v.transform((input) => input ?? {}),
          v.object({
            streetAddress: v.string(),
            city: v.string(),
            country: v.string(),
          }),
        ),
        pets: v.optional(
          v.array(
            v.object({
              animal: v.string(),
              name: v.string(),
            }),
          ),
        ),
      }),
    ),
  },
  {
    name: "standard-schema",
    validator: withStandardSchema(zodSchema),
  },
];

describe("Validation", () => {
  describe.each(validationTestCases)("Adapter for $name", ({ validator }) => {
    describe("validate", () => {
      it("should return the data when valid", async () => {
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
        expect(await validator.validate(person)).toEqual({
          data: person,
          error: undefined,
          submittedData: person,
        });
      });

      it("should omit internal fields", async () => {
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
        expect(await validator.validate(person)).toEqual({
          data: person,
          error: undefined,
          submittedData: person,
        });
      });

      it("should return field errors when invalid", async () => {
        const obj = { age: "hi!", pets: [{ animal: "dog" }] };
        expect(await validator.validate(obj)).toEqual({
          data: undefined,
          error: {
            fieldErrors: {
              firstName: anyString,
              lastName: anyString,
              age: anyString,
              "address.city": anyString,
              "address.country": anyString,
              "address.streetAddress": anyString,
              "pets[0].name": anyString,
            },
            subaction: undefined,
          },
          submittedData: obj,
        });
      });

      it("should unflatten data when validating", async () => {
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
        expect(await validator.validate(data)).toEqual({
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
          submittedData: objectFromPathEntries(Object.entries(data)),
        });
      });

      it("should accept FormData directly and return errors", async () => {
        const formData = new TestFormData();
        formData.set("firstName", "John");
        formData.set("lastName", "Doe");
        formData.set("address.streetAddress", "123 Main St");
        formData.set("address.country", "USA");
        formData.set("pets[0].animal", "dog");

        expect(await validator.validate(formData)).toEqual({
          data: undefined,
          error: {
            fieldErrors: {
              "address.city": anyString,
              "pets[0].name": anyString,
            },
            subaction: undefined,
          },
          submittedData: objectFromPathEntries([...formData.entries()]),
        });
      });

      it("should accept FormData directly and return valid data", async () => {
        const formData = new TestFormData();
        formData.set("firstName", "John");
        formData.set("lastName", "Doe");
        formData.set("address.streetAddress", "123 Main St");
        formData.set("address.country", "USA");
        formData.set("address.city", "Anytown");
        formData.set("pets[0].animal", "dog");
        formData.set("pets[0].name", "Fido");

        expect(await validator.validate(formData)).toEqual({
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
          subaction: undefined,
          submittedData: objectFromPathEntries([...formData.entries()]),
        });
      });

      it("should return the subaction in the ValidatorError if there is one", async () => {
        const person = {
          lastName: "Doe",
          age: 20,
          address: {
            streetAddress: "123 Main St",
            city: "Anytown",
            country: "USA",
          },
          pets: [{ animal: "dog", name: "Fido" }],
          subaction: "updatePerson",
        };
        expect(await validator.validate(person)).toEqual({
          error: {
            fieldErrors: {
              firstName: anyString,
            },
            formId: undefined,
          },
          data: undefined,
          submittedData: person,
          formId: undefined,
        });
      });
    });
  });
});
