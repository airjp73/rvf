import * as fs from "fs/promises";
import * as path from "path";
import * as semver from "semver";
import { describe, it, expect } from "vitest";

const packageDir = path.join(__dirname, "..");
const packageJsonPath = path.join(packageDir, "package.json");
const rvfPackageJsonPath = path.join(
  packageDir,
  "../remix-validated-form/package.json",
);

describe("peer dependecy version", () => {
  it("should have a peer dependency version that matches the lastet version of RVF", async () => {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const peerDependencyVersion = packageJson.peerDependencies["@rvf/remix"];
    const rvfPackageJson = JSON.parse(
      await fs.readFile(rvfPackageJsonPath, "utf-8"),
    );
    const rvfVersion = rvfPackageJson.version;

    expect(semver.satisfies(rvfVersion, peerDependencyVersion)).toBe(true);
  });
});
