/* eslint-disable @typescript-eslint/no-use-before-define */

// Things to figure out how to implement
// pick / omit from object schema. It's not really a refinement or transformation -- it's just a method.

type ValidationContext<Value> = {
  value: Value;
  meta: Record<string, any>;
};

type Refine<Input, Output> = (
  context: ValidationContext<Input>
) => Output | Promise<Output> | MaybePromise<Output>;

class ValidationError extends Error {}

type RefinementCreator<
  Input,
  Output,
  CR extends ChainObj,
  CT extends ChainObj
> = (...args: any[]) => Refinement<Input, Output, CR, CT>;

interface ChainObj {
  [key: string]: RefinementCreator<any, any, {}, {}>;
}
type ChainableRefinements<T> = Record<
  string,
  RefinementCreator<T, T, any, any>
>;
type ChainableTransforms<T> = Record<
  string,
  RefinementCreator<T, unknown, any, any>
>;

type ChainRefinementMethods<
  In,
  Out,
  CR extends ChainObj,
  CT extends ChainObj,
  Meta extends Record<any, any>
> = {
  [K in keyof CR]: CR[K] extends RefinementCreator<any, any, {}, {}>
    ? (...args: Parameters<CR[K]>) => RefinementType<In, Out, CR, CT, Meta>
    : never;
} & {
  [K in keyof CT]: CT[K] extends RefinementCreator<
    any,
    infer TransformOut,
    infer TransformCR,
    infer TransformCT
  >
    ? (
        ...args: Parameters<CT[K]>
      ) => RefinementType<In, TransformOut, TransformCR, TransformCT, Meta>
    : never;
};

type RefinementType<
  Input,
  Output,
  ChainRefines extends ChainObj,
  ChainTransforms extends ChainObj,
  Meta extends Record<any, any>
> = Refinement<Input, Output, ChainRefines, ChainTransforms, Meta> &
  ChainRefinementMethods<Input, Output, ChainRefines, ChainTransforms, Meta>;

type OutputType<T> = T extends Refinement<any, infer Out, {}, {}> ? Out : never;

/**
 * Improves readability of the tooltip for object intersections.
 * Instead of { a: string } & { b: string } you can get { a: string, b: string }
 */
type MergeIntersection<T> = {} & { [K in keyof T]: T[K] };
type Merge<T, U> = MergeIntersection<Omit<T, keyof U> & U>;

class Refinement<
  Input,
  Output,
  ChainRefines extends ChainObj,
  ChainTransforms extends ChainObj,
  Meta extends Record<any, any> = {}
> {
  private _refinement: Refine<Input, Output>;
  private _chainRefinements: ChainRefines;
  private _chainTransforms: ChainTransforms;
  private _metadata: Meta;

  static of<Input, Output>(
    refinement: Refine<Input, Output>
  ): Refinement<Input, Output, {}, {}>;
  static of<
    Input,
    Output,
    CR extends ChainableRefinements<Input>,
    CT extends ChainableTransforms<Input>,
    Meta extends Record<any, any>
  >(
    refinement: Refine<Input, Output>,
    chainRefines: CR,
    chainTransforms: CT,
    metadata: Meta
  ): RefinementType<Input, Output, CR, CT, Meta>;
  static of<
    Input,
    Output,
    CR extends ChainableRefinements<Input>,
    CT extends ChainableTransforms<Input>,
    Meta extends Record<any, any>
  >(
    refinement: Refine<Input, Output>,
    chainRefines?: CR,
    chainTransforms?: CT,
    metadata?: Meta
  ): any {
    if (chainRefines && chainTransforms && metadata)
      return new Refinement(
        refinement,
        chainRefines,
        chainTransforms,
        metadata
      );
    return new Refinement(refinement, {}, {}, {});
  }

  private constructor(
    refinement: Refine<Input, Output>,
    chainRefines: ChainRefines,
    chainTransforms: ChainTransforms,
    metadata: Meta
  ) {
    this._refinement = refinement;
    this._chainRefinements = chainRefines;
    this._chainTransforms = chainTransforms;
    this._metadata = metadata;

    for (const [method, creator] of Object.entries(chainRefines)) {
      (this as any)[method] = (...args: any[]) => {
        const refinement = creator(...args);
        return this.refine(refinement);
      };
    }

    for (const [method, creator] of Object.entries(chainTransforms)) {
      (this as any)[method] = (...args: any[]) => {
        const refinement = creator(...args);
        return this.transform(refinement);
      };
    }
  }

  validateSync(input: Input): Output {
    const context = { value: input, meta: this._metadata };
    try {
      return MaybePromise.of(() => this._refinement(context)).assertSync();
    } catch (err) {
      if (err instanceof Error) Error.captureStackTrace(err, this.validateSync);
      throw err;
    }
  }

  validateAsync(input: Input): Promise<Output> {
    const context = { value: input, meta: this._metadata };
    return MaybePromise.of(() => this._refinement(context)).await();
  }

  validateMaybeAsync(
    input: Input,
    metadata: Record<any, any>
  ): MaybePromise<Output> {
    const context = { value: input, meta: { ...this._metadata, ...metadata } };
    return MaybePromise.of(() => this._refinement(context));
  }

  refine<NewOutput extends Output>(
    refinement: Refinement<Output, NewOutput, {}, {}, {}>
  ): Refinement<Input, NewOutput, ChainRefines, ChainTransforms, Meta>;
  refine<NewOutput extends Output>(
    refine: Refine<Output, NewOutput>
  ): Refinement<Input, NewOutput, ChainRefines, ChainTransforms, Meta>;
  refine<NewOutput extends Output>(
    refinement:
      | Refinement<Output, NewOutput, {}, {}>
      | Refine<Output, NewOutput>
  ) {
    return Refinement.of<Input, NewOutput, ChainRefines, ChainTransforms, Meta>(
      (context) => {
        return this.validateMaybeAsync(context.value, this._metadata).then(
          (refined) => {
            if (typeof refinement === "function") {
              return refinement({ value: refined, meta: context.meta });
            }
            return refinement.validateMaybeAsync(refined, context.meta);
          }
        );
      },
      this._chainRefinements,
      this._chainTransforms,
      { ...this._metadata }
    );
  }

  transform<NewOutput, NewCR extends ChainObj, NewCT extends ChainObj>(
    refinement: Refinement<Output, NewOutput, NewCR, NewCT>
  ) {
    return Refinement.of<Input, NewOutput, NewCR, NewCT, Meta>(
      (context) => {
        return this.validateMaybeAsync(context.value, this._metadata).then(
          (refined) => refinement.validateMaybeAsync(refined, this._metadata)
        );
      },
      refinement._chainRefinements,
      refinement._chainTransforms,
      { ...this._metadata }
    );
  }

  as<NewOutput, NewCR extends ChainObj, NewCT extends ChainObj>(
    nextRefinement: Refinement<Output, NewOutput, NewCR, NewCT>
  ) {
    return Refinement.of<Input, NewOutput, NewCR, NewCT, Meta>(
      (context) => {
        return this.validateMaybeAsync(context.value, this._metadata).then(
          (refined) =>
            nextRefinement.validateMaybeAsync(refined, this._metadata)
        );
      },
      nextRefinement._chainRefinements,
      nextRefinement._chainTransforms,
      { ...this._metadata }
    );
  }

  setMetadata<Key extends string | number | symbol, Value>(
    key: Key,
    value: Value
  ): RefinementType<
    Input,
    Output,
    ChainRefines,
    ChainTransforms,
    Merge<Meta, { [K in Key]: Value }>
  > {
    return Refinement.of<Input, Output, ChainRefines, ChainTransforms, Meta>(
      (context) => this.validateMaybeAsync(context.value, this._metadata),
      this._chainRefinements,
      this._chainTransforms,
      { ...this._metadata, [key]: value }
    );
  }

  withRefinements<NewCR extends ChainObj>(
    chains: NewCR
  ): RefinementType<
    Input,
    Output,
    Merge<ChainRefines, NewCR>,
    ChainTransforms,
    Meta
  > {
    return Refinement.of(
      this._refinement,
      { ...this._chainRefinements, ...chains },
      this._chainTransforms,
      { ...this._metadata }
    );
  }

  withTransforms<NewCT extends ChainObj>(
    chains: NewCT
  ): RefinementType<
    Input,
    Output,
    ChainRefines,
    Merge<ChainTransforms, NewCT>,
    Meta
  > {
    return Refinement.of(
      this._refinement,
      this._chainRefinements,
      {
        ...this._chainTransforms,
        ...chains,
      },
      { ...this._metadata }
    );
  }
}

function makeRefinement<Input, Output extends Input>(
  refine: Refine<Input, Output>
): Refinement<Input, Output, {}, {}>;
function makeRefinement<
  Input,
  Output extends Input,
  Meta extends Record<any, any>
>(
  refine: Refine<Input, Output>,
  metadata: Meta
): Refinement<Input, Output, {}, {}, Meta>;
function makeRefinement<
  Input,
  Output extends Input,
  Meta extends Record<any, any>
>(refine: Refine<Input, Output>, metadata?: Meta) {
  if (metadata) return Refinement.of(refine, {}, {}, metadata);
  return Refinement.of(refine);
}

function makeTransform<Input, Output>(
  refine: Refine<Input, Output>
): Refinement<Input, Output, {}, {}>;
function makeTransform<Input, Output, Meta extends Record<any, any>>(
  refine: Refine<Input, Output>,
  metadata: Meta
): Refinement<Input, Output, {}, {}, Meta>;
function makeTransform<Input, Output, Meta extends Record<any, any>>(
  refine: Refine<Input, Output>,
  metadata?: Meta
) {
  if (metadata) return Refinement.of(refine, {}, {}, metadata);
  return Refinement.of(refine);
}

type AwaitedArray<T extends any[]> = {
  [K in keyof T]: Awaited<T[K]>;
};

type PossiblyPromise<T> = T | Promise<T> | MaybePromise<T>;
type AwaitableArray<T extends any[]> = {
  [K in keyof T]: PossiblyPromise<T[K]>;
};

type MaybePromiseResult<T> =
  | { type: "promise"; promise: Promise<T> }
  | { type: "value"; value: T }
  | { type: "error"; error: unknown };

class MaybePromise<T> {
  static all<Values extends unknown[]>(
    values: AwaitableArray<Values>
  ): MaybePromise<Values> {
    const awaitable = values.map((value) =>
      value instanceof MaybePromise ? value.await() : value
    );
    if (awaitable.some((value) => value instanceof Promise)) {
      return new MaybePromise(() => Promise.all(awaitable) as Promise<Values>);
    }
    return new MaybePromise(() => awaitable as AwaitedArray<Values>);
  }

  static of<Value>(
    func: () => Value | Promise<Value> | MaybePromise<Value>
  ): MaybePromise<Value> {
    return new MaybePromise(func);
  }

  private _result: MaybePromiseResult<T>;

  constructor(func: () => T | Promise<T> | MaybePromise<T>) {
    try {
      let result = func();
      while (result instanceof MaybePromise) {
        result = result.flatten();
      }

      if (result instanceof Promise) {
        this._result = { type: "promise", promise: result };
      } else {
        this._result = { type: "value", value: result };
      }
    } catch (error) {
      this._result = { type: "error", error };
    }
  }

  then = <U>(
    onFulfilled: (value: T) => U | Promise<U> | MaybePromise<U>
  ): MaybePromise<U> => {
    // If it's an error type, the return type doesn't matter too much
    if (this._result.type === "error") return this as any as MaybePromise<U>;

    if (this._result.type === "promise") {
      const { promise } = this._result;
      return MaybePromise.of(() =>
        promise.then((val) => {
          const result = onFulfilled(val);
          if (result instanceof MaybePromise) return result.await();
          return result;
        })
      );
    }

    const { value } = this._result;
    return MaybePromise.of(() => onFulfilled(value));
  };

  catch = <U = never>(onRejected: (err: unknown) => U): MaybePromise<U | T> => {
    if (this._result.type === "value") return this;

    if (this._result.type === "promise") {
      const { promise } = this._result;
      return MaybePromise.of(() =>
        promise.catch((err) => {
          const result = onRejected(err);
          if (result instanceof MaybePromise) return result.await();
          return result;
        })
      );
    }

    const { error } = this._result;
    return MaybePromise.of(() => onRejected(error));
  };

  await = async (): Promise<T> => this.flatten();

  assertSync = (): T => {
    const type = this._result.type;
    if (type === "promise") {
      throw new Error(
        "Expected a synchronous value but got an asynchronous one"
      );
    }
    if (type === "error") throw this._result.error;
    return this._result.value;
  };

  flatten = (): T | Promise<T> => {
    if (this._result.type === "error") throw this._result.error;
    if (this._result.type === "promise") return this._result.promise;
    return this._result.value;
  };
}

//// Implementations & testing

const u = Refinement.of<unknown, unknown>(({ value }) => value);

const str = makeRefinement<unknown, string>(({ value }) => {
  if (typeof value === "string") return value;
  if (value === undefined) throw new ValidationError("Required");
  throw new ValidationError("Not a string");
});

const number = u.refine(({ value, meta: { label } }) => {
  if (typeof value === "number") return value;
  if (value === undefined)
    throw new ValidationError(label ? `${label} is required` : "Required");
  throw new ValidationError(
    label ? `${label} is not a number` : "Not a number"
  );
});

const min = (min: number) =>
  makeRefinement<number, number>(({ value, meta: { label } }) => {
    if (value < min)
      throw new ValidationError(
        label ? `${label} must be at least ${min}` : `Must be at least ${min}`
      );
    return value;
  });

const max = (max: number) =>
  makeRefinement<number, number>(({ value, meta: { label } }) => {
    if (value > max)
      throw new ValidationError(
        label
          ? `${label} must be less than or equal to ${max}`
          : `Must be less than or equal to ${max}`
      );
    return value;
  });

const numChainable = number.withRefinements({ min, max });

const maxLength = (max: number) =>
  makeRefinement<string, string>(({ value }) => {
    if (value.length > max) throw new ValidationError(`Max length ${max}`);
    return value;
  });

const minLength = (min: number) =>
  makeRefinement<string, string>(({ value }) => {
    if (value.length < min) throw new ValidationError(`Min length ${min}`);
    return value;
  });

const stringToNumber = makeTransform<string, number>(({ value }) => {
  return Number(value);
});

const user = makeTransform<string, { id: string }>(({ value }) =>
  Promise.resolve({ id: value })
);

type UnionTypes<T extends Refinement<any, any, {}, {}>[]> = {
  [K in keyof T]: OutputType<T[K]>;
}[number];
const union = <T extends Refinement<any, any, {}, {}>[]>(...types: T) =>
  makeRefinement<unknown, UnionTypes<T>>(({ value, meta }) => {
    const [firstType, ...restTypes] = types;
    let maybe = firstType.validateMaybeAsync(value, meta);
    for (const type of restTypes) {
      maybe = maybe.catch(() => type.validateMaybeAsync(value, meta));
    }
    return maybe;
  });

type ObjectOutput<T extends Record<any, Refinement<any, any, {}, {}>>> = {
  [K in keyof T]: OutputType<T[K]>;
};

const unknownRecord = makeRefinement<unknown, Record<any, unknown>>(
  ({ value }) => {
    if (value !== null && typeof value === "object" && !Array.isArray(value))
      return value as Record<any, unknown>;
    throw new ValidationError("Not an object");
  }
);
const object = <T extends Record<any, Refinement<any, any, {}, {}>>>(
  typeObj: T
): Refinement<any, ObjectOutput<T>, {}, {}> => {
  return makeRefinement<unknown, ObjectOutput<T>>(({ value, meta }) => {
    if (value === null || value === undefined) throw new Error("Required");
    const valueObj = unknownRecord.validateSync(value);
    const keys = Object.keys(typeObj);
    const maybes = Object.entries(typeObj).map(([key, type]) =>
      type.validateMaybeAsync(valueObj[key], meta)
    );
    return MaybePromise.all(maybes)
      .then((newValues) => newValues.map((val, index) => [keys[index], val]))
      .then(Object.fromEntries);
  });
};

const undef = makeRefinement<unknown, undefined>(({ value }) => {
  if (value === undefined) return undefined;
  throw new ValidationError("Not undefined");
});
const optional = <T extends Refinement<any, any, {}, {}>>(refinement: T) =>
  union(undef, refinement);

const testing = stringToNumber.as(numChainable);
const strChainable = str
  .withRefinements({
    minLength,
    maxLength,
  })
  .withTransforms({
    stringToNumber: () => testing,
  });

const test = u.setMetadata("label", "").withRefinements({
  number: () => numChainable,
});
test.number();
const label = (labelString: string) =>
  u.setMetadata("label", labelString).withTransforms({
    string: () => strChainable,
    number: () => numChainable,
  });

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  const expectString = (arg: string) => {
    expect(typeof arg === "string").toBe(true);
  };

  const expectNumber = (arg: number) => {
    expect(typeof arg === "number").toBe(true);
  };

  describe("union", () => {
    it("should validate a union of types", () => {
      const s = union(str, number);
      expect(() => s.validateSync(undefined)).toThrow();
      expect(() => s.validateSync({})).toThrow();
      expect(s.validateSync("something")).toEqual("something");
      expect(s.validateSync(123)).toEqual(123);
    });

    it("should work correctly with async", async () => {
      const s = union(str.transform(user), number);
      expect(() => s.validateSync("123")).toThrow();
      expect(await s.validateAsync("something")).toEqual({ id: "something" });

      // This technically works synchronously too, but it should be used async
      // so that's what we should test
      expect(await s.validateAsync(123)).toEqual(123);
    });
  });

  describe("object", () => {
    it("should validate objects", async () => {
      const s = object({
        field1: strChainable.maxLength(10),
        field2: strChainable.minLength(5).transform(user),
        field3: numChainable.max(3),
        field4: optional(numChainable.min(4)),
      });

      expect(
        await s.validateAsync({
          field1: "123",
          field2: "12345",
          field3: 2,
        })
      ).toEqual({
        field1: "123",
        field2: { id: "12345" },
        field3: 2,
      });

      expect(
        await s.validateAsync({
          field1: "123",
          field2: "12345",
          field3: 2,
          field4: 4,
        })
      ).toEqual({
        field1: "123",
        field2: { id: "12345" },
        field3: 2,
        field4: 4,
      });

      await expect(
        s.validateAsync({ field1: "123", field2: "12345" })
      ).rejects.toThrow();
      await expect(
        s.validateAsync({
          field1: "123",
          field2: "12345",
          field3: 2,
          field4: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("core", () => {
    it("should validate", () => {
      expect(str.validateSync("hello")).toEqual("hello");
      expect(() => str.validateSync(undefined)).toThrow();
    });

    it("should refine", () => {
      const s = str.refine(maxLength(5)).refine(minLength(3));
      expect(() => s.validateSync("12")).toThrow();
      expect(s.validateSync("123")).toEqual("123");
      expect(s.validateSync("1234")).toEqual("1234");
      expect(s.validateSync("12345")).toEqual("12345");
      expect(() => s.validateSync("123456")).toThrow();
    });

    it("should be able to refine, transform, and continue refining on new type", () => {
      const s = str
        .refine(maxLength(5))
        .transform(stringToNumber)
        .as(number)
        .refine(max(99999));

      expect(s.validateSync("12")).toEqual(12);
      expect(s.validateSync("12345")).toEqual(12345);
      expect(s.validateSync("99999")).toEqual(99999);
      expect(() => s.validateSync("100000")).toThrow();
    });

    it("should be nestable", () => {
      const s = str.transform(stringToNumber).refine(number.refine(max(10)));
      expect(() => s.validateSync("11")).toThrow();
      expect(s.validateSync("10")).toEqual(10);
      expect(s.validateSync("9")).toEqual(9);
    });

    it("should be chainable", () => {
      const s = strChainable.maxLength(2).minLength(1).stringToNumber().max(11);
      expect(s.validateSync("1")).toEqual(1);
      expect(s.validateSync("11")).toEqual(11);
      expect(() => s.validateSync("12")).toThrow();
      expect(() => s.validateSync("")).toThrow();
    });

    it("should handle async refinements", async () => {
      const s = str.refine(maxLength(6)).refine(minLength(6)).transform(user);
      expect(await s.validateAsync("123456")).toEqual({ id: "123456" });
      expect(() => s.validateSync("123456")).toThrow();
      expect(await s.validateMaybeAsync("123456", {}).await()).toEqual({
        id: "123456",
      });
    });

    it("should only change metadata for subsequent chains", () => {
      const s = label("MyNumber")
        .number()
        .setMetadata("label", "MyNumber2")
        .min(1)
        .setMetadata("label", "MyNumber3")
        .max(2);
      expect(() => s.validateSync(undefined)).toThrowError(
        "MyNumber is required"
      );
      expect(() => s.validateSync(0)).toThrowError(
        "MyNumber2 must be at least 1"
      );
      expect(() => s.validateSync(3)).toThrowError(
        "MyNumber3 must be less than or equal to 2"
      );

      const s2 = numChainable.min(1).setMetadata("label", "MyNumber").max(2);
      expect(() => s2.validateSync(undefined)).toThrowError("Required");
      expect(() => s2.validateSync(0)).toThrowError("Must be at least 1");
      expect(() => s2.validateSync(3)).toThrowError(
        "MyNumber must be less than or equal to 2"
      );

      const s3 = number
        .refine(min(1))
        .setMetadata("label", "MyNumber")
        .refine(max(2));
      expect(() => s3.validateSync(undefined)).toThrowError("Required");
      expect(() => s3.validateSync(0)).toThrowError("Must be at least 1");
      expect(() => s3.validateSync(3)).toThrowError(
        "MyNumber must be less than or equal to 2"
      );

      const s4 = number
        .setMetadata("label", "MyNumber")
        .refine(min(1))
        .refine(max(2));
      expect(() => s4.validateSync(undefined)).toThrowError("Required");
      expect(() => s4.validateSync(0)).toThrowError(
        "MyNumber must be at least 1"
      );
      expect(() => s4.validateSync(3)).toThrowError(
        "MyNumber must be less than or equal to 2"
      );
    });
  });

  describe("MaybePromise", () => {
    it("should work with promises", async () => {
      const prom = new MaybePromise(() => Promise.resolve("hello"));
      expect(await prom.await()).toEqual("hello");
      expect(() => prom.assertSync()).toThrow();
    });

    it("should work with non promises", async () => {
      const prom = new MaybePromise(() => "hello");
      expect(await prom.await()).toEqual("hello");
      expect(prom.assertSync()).toEqual("hello");
    });

    it("should be thenable", async () => {
      const test = new MaybePromise(() => "hell")
        .then((value) => value + "o")
        .then((value) => value + "!")
        .then((value) => Promise.resolve(value + "!"))
        .then((value) => new MaybePromise(() => value + "!"));
      expect(await test.await()).toEqual("hello!!!");
    });

    it("should be catchable", () => {
      const test = new MaybePromise(() => {
        throw new Error("Hi");
      })
        .catch((err: any) => err.message)
        .then((msg) => msg + "!");
      expect(test.assertSync()).toEqual("Hi!");
    });

    it("should be catchable with promises", async () => {
      const test = new MaybePromise(() => Promise.reject(new Error("Hi")))
        .catch((err: any) => err.message)
        .then((msg) => msg + "!");
      expect(await test.await()).toEqual("Hi!");
    });

    it("should be catchable with maybe promises", async () => {
      const test = new MaybePromise(
        () =>
          new MaybePromise(() => {
            throw new Error("Hi");
          })
      )
        .catch((err: any) => err.message)
        .then((msg) => msg + "!");
      expect(await test.await()).toEqual("Hi!");
    });

    it("should correctly type transformations when then chaining", async () => {
      const test = new MaybePromise(() => 123)
        .then((value) => {
          expectNumber(value);
          return value + 1;
        })
        .then((value) => {
          expectNumber(value);
          return String(value);
        })
        .then((value) => {
          expectString(value);
          return Promise.resolve(value.charCodeAt(0));
        })
        .then((value) => {
          expectNumber(value);
          return new MaybePromise(() => String(value));
        });
      const result: string = await test.await();
      expect(result).toEqual("49");
    });
  });
}
