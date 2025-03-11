import * as fs from "fs/promises";
import * as path from "path";
import * as semver from "semver";
import { anyString } from "@remix-validated-form/test-utils";
import { describe, it, expect } from "vitest";
import * as v from "valibot";

import { withValibot } from "./";

const packageDir = path.join(__dirname, "..");
const packageJsonPath = path.join(packageDir, "package.json");
const corePackageJsonPath = path.join(packageDir, "../core/package.json");

describe("withValibot", () => {
  it("returns coherent errors for complex schemas", async () => {
    const schema = v.union([
      v.object({
        type: v.literal("foo"),
        foo: v.string(),
      }),
      v.object({
        type: v.literal("bar"),
        bar: v.string(),
      }),
    ]);
    const obj = {
      type: "foo",
      bar: 123,
      foo: 123,
    };

    expect(await withValibot(schema).validate(obj)).toEqual({
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
    const schema = v.object({
      field1: v.union([v.literal("foo"), v.literal("bar")]),
      field2: v.union([v.literal("foo"), v.literal("bar")]),
    });
    const obj = {
      field1: "a value",
      // field2 missing
    };

    const validator = withValibot(schema);
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
});

describe("dependecy version", () => {
  it("should have a dependency version that matches the lastet version of RVF", async () => {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const dependencyVersion = packageJson.dependencies["@rvf/core"];
    const rvfPackageJson = JSON.parse(
      await fs.readFile(corePackageJsonPath, "utf-8"),
    );
    const rvfVersion = rvfPackageJson.version;

    expect(semver.satisfies(rvfVersion, dependencyVersion)).toBe(true);
  });
});
