export const nestedObjectToPathObject = (
  val: any,
  acc: Record<string, any>,
  path: string
): any => {
  if (Array.isArray(val)) {
    val.forEach((v, index) =>
      nestedObjectToPathObject(v, acc, `${path}[${index}]`)
    );
    return acc;
  }

  if (typeof val === "object") {
    Object.entries(val).forEach(([key, value]) => {
      const nextPath = path ? `${path}.${key}` : key;
      nestedObjectToPathObject(value, acc, nextPath);
    });
    return acc;
  }

  if (val !== undefined) {
    acc[path] = val;
  }

  return acc;
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("nestedObjectToPathObject", () => {
    it("should return an object with the correct path", () => {
      const result = nestedObjectToPathObject(
        {
          a: 1,
          b: 2,
          c: { foo: "bar", baz: [true, false] },
          d: [
            { foo: "bar", baz: [true, false] },
            { e: true, f: "hi" },
          ],
          g: undefined,
        },
        {},
        ""
      );

      expect(result).toEqual({
        a: 1,
        b: 2,
        "c.foo": "bar",
        "c.baz[0]": true,
        "c.baz[1]": false,
        "d[0].foo": "bar",
        "d[0].baz[0]": true,
        "d[0].baz[1]": false,
        "d[1].e": true,
        "d[1].f": "hi",
      });
      expect(Object.keys(result)).toHaveLength(10);
    });
  });
}
