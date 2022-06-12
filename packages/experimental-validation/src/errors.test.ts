import { describe, expect, it } from "vitest";
import { ValidationError } from "./errors";

describe("ValidationError", () => {
  // Definitely
  it("should correctly set the path for object validations");
  it("should correctly set the path for array validations");
  it("should return all issues for union validations");
  it("should be able to construct a path string from path segments");

  it("should be able to prependPath", () => {
    const error = new ValidationError({
      message: "Something",
      pathSegments: ["one", "two"],
      nested: [
        new ValidationError({
          message: "Something else",
          pathSegments: ["one", "two", "foo"],
        }),
        new ValidationError({
          message: "Another thing",
          pathSegments: ["one", "two", "bar"],
        }),
      ],
    });
    expect(error.message).toEqual("Something");
    expect(error.pathSegments).toEqual(["one", "two"]);

    const prepended = error.prependPath("zero");
    expect(prepended.pathSegments).toEqual(["zero", "one", "two"]);
    expect(prepended.nested[0].pathSegments).toEqual([
      "zero",
      "one",
      "two",
      "foo",
    ]);
    expect(prepended.nested[1].pathSegments).toEqual([
      "zero",
      "one",
      "two",
      "bar",
    ]);
  });

  it("should return path string", () => {
    const error = new ValidationError({
      message: "Something",
      pathSegments: ["one", "two", 2, "bar"],
    });
    expect(error.getPathString()).toEqual("one.two[2].bar");
  });

  // Maybe
  it(
    "should be able to make a best-guess at which union in an object is failing"
  );
});
