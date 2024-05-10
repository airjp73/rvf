import * as fs from "fs/promises";
import * as path from "path";
import { anyString } from "@remix-validated-form/test-utils";
import * as semver from "semver";
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { withZod } from "./";

describe("withZod", () => {
  it("returns coherent errors for complex schemas", async () => {
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

    expect(await withZod(schema).validate(obj)).toEqual({
      data: undefined,
      error: {
        fieldErrors: {
          type: anyString,
          bar: anyString,
          foo: anyString,
        },
        subaction: undefined,
      },
      submittedData: obj,
    });
  });

  it("returns errors for fields that are unions", async () => {
    const schema = z.object({
      field1: z.union([z.literal("foo"), z.literal("bar")]),
      field2: z.union([z.literal("foo"), z.literal("bar")]),
    });
    const obj = {
      field1: "a value",
      // field2 missing
    };

    const validator = withZod(schema);
    expect(await validator.validate(obj)).toEqual({
      data: undefined,
      error: {
        fieldErrors: {
          field1: anyString,
          field2: anyString,
        },
        subaction: undefined,
      },
      submittedData: obj,
    });
  });

  it("returns custom error message when using a custom error map", async () => {
    const schema = z.object({
      type: z.string(),
    });
    const obj = {
      type: 123,
    };

    const errorMap: z.ZodErrorMap = () => ({ message: "Custom error" });

    expect(await withZod(schema, { errorMap }).validate(obj)).toEqual({
      data: undefined,
      error: {
        fieldErrors: {
          type: "Custom error",
        },
        subaction: undefined,
      },
      submittedData: obj,
    });
  });
});

const packageDir = path.join(__dirname, "..");
const packageJsonPath = path.join(packageDir, "package.json");
const corePackageJsonPath = path.join(packageDir, "../core/package.json");

describe("peer dependecy version", () => {
  it("should have a peer dependency version that matches the lastet version of RVF", async () => {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const peerDependencyVersion = packageJson.peerDependencies["@rvf/core"];
    const rvfPackageJson = JSON.parse(
      await fs.readFile(corePackageJsonPath, "utf-8"),
    );
    const rvfVersion = rvfPackageJson.version;

    expect(semver.satisfies(rvfVersion, peerDependencyVersion)).toBe(true);
  });
});
