import { expect, it } from "vitest";
import { toPathObject } from "./toPathObject";
import { mergePathStrings } from "./mergePathStrings";

it("should merge regular paths", () => {
  expect(mergePathStrings("a", "b", "c")).toBe("a.b.c");
  expect(mergePathStrings("a.b", "c")).toBe("a.b.c");
});

it("should merge paths with numbers", () => {
  expect(mergePathStrings("a", 0, "c")).toBe("a[0].c");
  expect(mergePathStrings("a.b", "0.c")).toBe("a.b[0].c");
});

it("should handle nullish value", () => {
  expect(mergePathStrings("a", null, "c")).toBe("a.c");
  expect(mergePathStrings("a.b", undefined, "c")).toBe("a.b.c");
});
