import { describe, expectTypeOf, it } from "vitest";
import {
  StringToPathTuple,
  ValidStringPaths,
  ValidStringPathsToArrays,
  ValueAtPath,
} from "./types";

describe("ValueAtPath type", () => {
  it("should get a deeply nested value", () => {
    type state = {
      a: {
        b: {
          c: 1;
        };
      };
    };
    expectTypeOf<ValueAtPath<state, ["a", "b", "c"]>>().toMatchTypeOf<1>();
  });

  it("should be never to provide an invalid path", () => {
    type state = {
      a: {
        b: {
          c: 1;
        };
      };
    };

    type res = ValueAtPath<state, ["a", "b", "c", "d"]>;
    expectTypeOf<res>().toMatchTypeOf<never>();
  });

  it("should work with tuples", () => {
    type state = {
      a: {
        b: [1, 2, { c: 3 }];
      };
    };
    expectTypeOf<ValueAtPath<state, ["a", "b"]>>().toMatchTypeOf<
      [1, 2, { c: 3 }]
    >();
    expectTypeOf<ValueAtPath<state, ["a", "b", 1]>>().toMatchTypeOf<2>();
    expectTypeOf<ValueAtPath<state, ["a", "b", 2, "c"]>>().toMatchTypeOf<3>();
  });

  it("should work with arrays", () => {
    type state = {
      a: {
        b: { c: 3 }[];
      };
    };
    expectTypeOf<ValueAtPath<state, ["a", "b"]>>().toMatchTypeOf<{ c: 3 }[]>();
    expectTypeOf<ValueAtPath<state, ["a", "b", 1]>>().toMatchTypeOf<{ c: 3 }>();
    expectTypeOf<ValueAtPath<state, ["a", "b", 2, "c"]>>().toMatchTypeOf<3>();
  });

  it("should work with arrays and path strings", () => {
    type state = {
      a: {
        b: { c: 3 }[];
      };
    };

    expectTypeOf<ValueAtPath<state, StringToPathTuple<"a.b">>>().toMatchTypeOf<
      { c: 3 }[]
    >();
    expectTypeOf<
      ValueAtPath<state, StringToPathTuple<"a.b.0">>
    >().toMatchTypeOf<{ c: 3 }>();
    expectTypeOf<
      ValueAtPath<state, StringToPathTuple<"a.b.1.c">>
    >().toMatchTypeOf<3>();
  });
});

describe("StringToPathTuple type", () => {
  it("should work with arrays", () => {
    type actual = StringToPathTuple<"a.b.0.3">;
    expectTypeOf<actual>().toMatchTypeOf<["a", "b", 0, 3]>();
  });

  it("should work with computed notation", () => {
    type actual = StringToPathTuple<"a.b[0].a">;
    expectTypeOf<actual>().toMatchTypeOf<["a", "b", 0, "a"]>();
  });

  it("should work with chained computed notation", () => {
    type actual = StringToPathTuple<"a.b[0][1]">;
    expectTypeOf<actual>().toMatchTypeOf<["a", "b", 0, 1]>();
  });
});

describe("ValidStringPaths type", () => {
  it("should return all possible string paths", () => {
    type state = {
      a: {
        b: {
          c: 1;
        };
      };
    };
    type result = ValidStringPaths<state>;
    expectTypeOf<result>().toEqualTypeOf<"a" | "a.b" | "a.b.c">();
  });

  it("should work with arrays", () => {
    type state = {
      a: {
        b: [
          {
            c: 1;
          }
        ];
      };
    };
    expectTypeOf<ValidStringPaths<state>>().toEqualTypeOf<
      "a" | "a.b" | `a.b[${number}]` | `a.b[${number}].c`
    >();
  });
});

describe("ValidStringPathsToArrays type", () => {
  it("should return all possible string paths to arrays", () => {
    type state = {
      a: {
        b: string[];
        c: { d: string[] }[];
      };
      e: number[];
      f: [number];
    };

    type result = ValidStringPathsToArrays<state>;
    expectTypeOf<result>().toEqualTypeOf<
      "a.b" | "a.c" | `a.c[${number}].d` | "e" | "f"
    >();
  });
});
