import { describe, it } from "vitest";

describe("ValidationError", () => {
  // Definitely
  it("should correctly set the path for object validations");
  it("should correctly set the path for array validations");
  it("should return all issues for union validations");
  it("should be able to construct a path string from path segments");

  // Maybe
  it(
    "should be able to make a best-guess at which union in an object is failing"
  );
});
