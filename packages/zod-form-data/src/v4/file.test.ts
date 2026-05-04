import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { z } from "zod";

import * as zfd from "./file";
import { expectError, expectValid } from "../test/lib";

describe("zfd v4 file", () => {
  class MockFile {
    size: number;

    constructor(size: number) {
      this.size = size;
    }
  }

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).File = MockFile;
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).File;
  });

  it("should convert empty files to undefined", () => {
    const file = new MockFile(0);
    const s = zfd.file();
    expectError(s, file);
  });

  it("should handle optional", () => {
    const file = new MockFile(0);
    const s = zfd.file(z.instanceof(File).optional());
    expect(s.parse(file)).toBeUndefined();
  });

  it("should handle nullable", () => {
    const file = new MockFile(0);
    const s = zfd.file(z.instanceof(File).nullable(), null);
    expect(s.parse(file)).toBeNull();
  });

  it("should return data as-is for files that are not empty", () => {
    const file = new MockFile(50);
    const s = zfd.file();
    expectValid(s, file);
  });
});
