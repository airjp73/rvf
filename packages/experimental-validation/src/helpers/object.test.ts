import { describe, expect, it } from "vitest";
import { ValidationError } from "../errors";
import { expectType } from "../testHelpers";
import { number } from "./number";
import { object } from "./object";
import { string } from "./string";

const expectValidationError = (
  func: () => void,
  errFunc: (err: ValidationError) => void
) => {
  try {
    func();
    expect(true).toBe("Should have thrown");
  } catch (err) {
    expect(err).toBeInstanceOf(ValidationError);
    errFunc(err);
  }
};

const infoDetails = (error: ValidationError) => {
  return {
    message: error.message,
    baseMessage: error.baseMessage,
    pathSegments: error.pathSegments,
    nested: error.nested.map(infoDetails),
  };
};

describe("object", () => {
  it("should pass if all fields are valid", () => {
    const s = object({
      foo: string(),
      bar: string().optional(),
      baz: number(),
    });

    const r1 = s.validateSync({
      foo: "asdf",
      baz: 123,
    });
    expectType<{
      foo: string;
      bar?: string;
      baz: number;
    }>(r1);
    expect(r1).toEqual({
      foo: "asdf",
      bar: undefined,
      baz: 123,
    });

    const r2 = s.validateSync({ foo: "asdf", bar: "qwer", baz: 123 });
    expectType<{
      foo: string;
      bar?: string;
      baz: number;
    }>(r2);
    expect(r2).toEqual({
      foo: "asdf",
      bar: "qwer",
      baz: 123,
    });
  });

  it("should pass with nested objects", () => {
    const s = object({
      foo: string(),
      bar: object({
        foo: string(),
        baz: object({
          foo: string(),
        }),
      }),
    });

    const res = s.validateSync({
      foo: "asdf",
      bar: {
        foo: "qwer",
        baz: {
          foo: "zxcv",
        },
      },
    });
    expectType<{
      foo: string;
      bar: {
        foo: string;
        baz: {
          foo: string;
        };
      };
    }>(res);
    expect(res).toEqual({
      foo: "asdf",
      bar: {
        foo: "qwer",
        baz: {
          foo: "zxcv",
        },
      },
    });
  });

  it("should fail if any field fails", () => {
    const s = object({
      foo: string(),
      bar: string().optional(),
      baz: number(),
    });

    expectValidationError(
      () => s.validateSync({}),
      (err) => {
        expect(infoDetails(err)).toMatchInlineSnapshot(`
          {
            "baseMessage": "Object validation failed",
            "message": "Object validation failed",
            "nested": [
              {
                "baseMessage": "Expected a string",
                "message": "foo: Expected a string",
                "nested": [],
                "pathSegments": [
                  "foo",
                ],
              },
              {
                "baseMessage": "Expected a number",
                "message": "baz: Expected a number",
                "nested": [],
                "pathSegments": [
                  "baz",
                ],
              },
            ],
            "pathSegments": [],
          }
        `);
      }
    );
    expectValidationError(
      () =>
        s.validateSync({
          foo: "asdf",
        }),
      (err) => {
        expect(infoDetails(err)).toMatchInlineSnapshot(`
          {
            "baseMessage": "Object validation failed",
            "message": "Object validation failed",
            "nested": [
              {
                "baseMessage": "Expected a number",
                "message": "baz: Expected a number",
                "nested": [],
                "pathSegments": [
                  "baz",
                ],
              },
            ],
            "pathSegments": [],
          }
        `);
      }
    );
    expectValidationError(
      () =>
        s.validateSync({
          foo: "asdf",
          baz: "asdf",
        }),
      (err) => {
        expect(infoDetails(err)).toMatchInlineSnapshot(`
          {
            "baseMessage": "Object validation failed",
            "message": "Object validation failed",
            "nested": [
              {
                "baseMessage": "Expected a number",
                "message": "baz: Expected a number",
                "nested": [],
                "pathSegments": [
                  "baz",
                ],
              },
            ],
            "pathSegments": [],
          }
        `);
      }
    );
  });

  it("should continue to build up paths when nested", () => {
    const s = object({
      foo: string(),
      bar: object({
        foo: string(),
        baz: object({
          foo: string(),
        }),
      }),
    });

    expectValidationError(
      () =>
        s.validateSync({
          bar: {
            baz: {},
          },
        }),
      (err) => {
        expect(infoDetails(err)).toMatchInlineSnapshot(`
          {
            "baseMessage": "Object validation failed",
            "message": "Object validation failed",
            "nested": [
              {
                "baseMessage": "Expected a string",
                "message": "foo: Expected a string",
                "nested": [],
                "pathSegments": [
                  "foo",
                ],
              },
              {
                "baseMessage": "Object validation failed",
                "message": "bar: Object validation failed",
                "nested": [
                  {
                    "baseMessage": "Expected a string",
                    "message": "bar.foo: Expected a string",
                    "nested": [],
                    "pathSegments": [
                      "bar",
                      "foo",
                    ],
                  },
                  {
                    "baseMessage": "Object validation failed",
                    "message": "bar.baz: Object validation failed",
                    "nested": [
                      {
                        "baseMessage": "Expected a string",
                        "message": "bar.baz.foo: Expected a string",
                        "nested": [],
                        "pathSegments": [
                          "bar",
                          "baz",
                          "foo",
                        ],
                      },
                    ],
                    "pathSegments": [
                      "bar",
                      "baz",
                    ],
                  },
                ],
                "pathSegments": [
                  "bar",
                ],
              },
            ],
            "pathSegments": [],
          }
        `);
      }
    );
  });

  it("should have a type error for non objects", () => {
    const s = object({
      bar: object({}),
    });

    expectValidationError(
      () => s.validateSync({}),
      (err) => {
        expect(infoDetails(err)).toMatchInlineSnapshot(`
          {
            "baseMessage": "Object validation failed",
            "message": "Object validation failed",
            "nested": [
              {
                "baseMessage": "Expected a record",
                "message": "bar: Expected a record",
                "nested": [],
                "pathSegments": [
                  "bar",
                ],
              },
            ],
            "pathSegments": [],
          }
        `);
      }
    );
  });
});
