import { expect, it } from "vitest";
import { toPathObject } from "./toPathObject";

it("should take a nested object and return a flat one with path strings", () => {
  const obj = {
    a: {
      b: {
        c: 1,
      },
    },
    c: 2,
  };
  expect(toPathObject(obj)).toEqual({
    "a.b.c": 1,
    c: 2,
  });
});

it("should work with arrays", () => {
  const obj = {
    a: {
      b: [1, 2, { c: 3 }],
    },
  };
  expect(toPathObject(obj)).toEqual({
    "a.b[0]": 1,
    "a.b[1]": 2,
    "a.b[2].c": 3,
  });
});

it("should work with nested arrays", () => {
  const obj = {
    a: {
      b: [1, [2], { c: 3 }],
    },
    d: [{ e: 4 }, { f: 5 }],
  };
  expect(toPathObject(obj)).toEqual({
    "a.b[0]": 1,
    "a.b[1][0]": 2,
    "a.b[2].c": 3,
    "d[0].e": 4,
    "d[1].f": 5,
  });
});

it("should work with already flat objects", () => {
  const obj = {
    a: "a",
    b: "b",
    c: "c",
  };
  expect(toPathObject(obj)).toEqual(obj);
});
