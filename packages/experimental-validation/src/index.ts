/* eslint-disable @typescript-eslint/no-use-before-define */

type ValidationContext<Value> = {
  value: Value;
};

type Refine<Input, Output> = (
  context: ValidationContext<Input>
) => Output | Promise<Output> | MaybePromise<Output>;

class ValidationError extends Error {}

type RefinementCreator<Input, Output> = (
  ...args: any[]
) => Refinement<Input, Output, {}>;

type ChainObj = Record<string, RefinementCreator<any, any>>;

// type ChainMethods<T extends ChainObj> = {
//   [K in keyof T]: T[K] extends RefinementCreator<infer In, infer Out>
//     ? (...args: Parameters<T[K]>) => Refinement<In, Out, {}>
//     : never;
// };

// abstract class Type<Input, Output> {
//   abstract perform: Refine<Input, Output>;
// }

// type RefinementInput<R> = R extends Refinement<infer In, any, any> ? In : never;
// type RefinementOutput<R> = R extends Refinement<any, infer Out, any>
//   ? Out
//   : never;
// type RefinementChains<R> = R extends Refinement<any, any, infer Chains>
//   ? Chains
//   : never;

class Refinement<Input, Output, Chains extends ChainObj> {
  private _refinement: Refine<Input, Output>;
  private _chains: Chains;

  static of<Input, Output>(
    refinement: Refine<Input, Output>
  ): Refinement<Input, Output, {}>;
  static of<Input, Output, Chains extends ChainObj>(
    refinement: Refine<Input, Output>,
    chains: Chains
  ): Refinement<Input, Output, Chains> & Chains;
  static of<Input, Output, Chains extends ChainObj>(
    refinement: Refine<Input, Output>,
    chains?: Chains
  ): any {
    if (chains) return new Refinement(refinement, chains);
    return new Refinement(refinement, {});
  }

  private constructor(refinement: Refine<Input, Output>, chains: Chains) {
    this._refinement = refinement;
    this._chains = chains;

    // for (const [method, creator] of Object.entries(chains)) {
    //   this[method] = (...args: any[]) => {
    //     const refinement = creator(...args);
    //     return this.refine(refinement);
    //   };
    // }
  }

  validateSync(input: Input): Output {
    const context = { value: input };
    return MaybePromise.of(this._refinement(context)).assertSync();
  }

  validateAsync(input: Input): Promise<Output> {
    const context = { value: input };
    return MaybePromise.of(this._refinement(context)).await();
  }

  validateMaybeAsync(input: Input): MaybePromise<Output> {
    const context = { value: input };
    return MaybePromise.of(this._refinement(context));
  }

  refine<NewOutput extends Output>(
    refinement: Refinement<Output, NewOutput, Chains>
  ) {
    return new Refinement<Input, NewOutput, Chains>((context) => {
      return this.validateMaybeAsync(context.value).then((refined) =>
        refinement.validateMaybeAsync(refined)
      );
    }, this._chains);
  }

  transform<NewOutput>(refinement: Refinement<Output, NewOutput, Chains>) {
    return new Refinement<Input, NewOutput, {}>((context) => {
      return this.validateMaybeAsync(context.value).then((refined) =>
        refinement.validateMaybeAsync(refined)
      );
    }, {});
  }

  as<NewOutput, NewChains extends ChainObj>(
    nextRefinement: Refinement<Output, NewOutput, NewChains>
  ) {
    return new Refinement<Input, NewOutput, NewChains>((context) => {
      return this.validateMaybeAsync(context.value).then((refined) =>
        nextRefinement.validateMaybeAsync(refined)
      );
    }, nextRefinement._chains);
  }
}

const makeRefinement = <Input, Output>(refine: Refine<Input, Output>) =>
  Refinement.of(refine);

type AwaitedArray<T extends any[]> = {
  [K in keyof T]: Awaited<T[K]>;
};

class MaybePromise<T> {
  static all<Values extends any[]>(
    ...values: Values
  ): MaybePromise<AwaitedArray<Values>> {
    if (values.some((value) => value instanceof Promise)) {
      return new MaybePromise(Promise.all(values));
    }
    return new MaybePromise(values as AwaitedArray<Values>);
  }

  static of<Value>(
    value: Value | Promise<Value> | MaybePromise<Value>
  ): MaybePromise<Value> {
    if (value instanceof MaybePromise) return value;
    return new MaybePromise(value);
  }

  private _value: T | Promise<T>;

  constructor(value: T | Promise<T>) {
    this._value = value;
  }

  then = <U>(
    onFulfilled: (value: T) => U | Promise<U> | MaybePromise<U>
  ): MaybePromise<U> => {
    if (this._value instanceof Promise) {
      return MaybePromise.of(
        this._value.then((val) => {
          const result = onFulfilled(val);
          if (result instanceof MaybePromise) return result.await();
          return result;
        })
      );
    }
    return MaybePromise.of(onFulfilled(this._value));
  };

  await = async () => this._value;

  assertSync = () => {
    if (this._value instanceof Promise) {
      throw new Error(
        "Expected a synchronous value but got an asynchronous one"
      );
    }
    return this._value;
  };
}

//// Implementations & testing

const str = makeRefinement<unknown, string>(({ value }) => {
  if (typeof value === "string") return value;
  if (value === undefined) throw new ValidationError("Required");
  throw new ValidationError("Not a string");
});

const number = makeRefinement<unknown, number>(({ value }) => {
  if (typeof value === "number") return value;
  if (value === undefined) throw new ValidationError("Required");
  throw new ValidationError("Not a number");
});

const min = (min: number) =>
  makeRefinement<number, number>(({ value }) => {
    if (value < min) throw new ValidationError(`Must be at least ${min}`);
    return value;
  });

const max = (max: number) =>
  makeRefinement<number, number>(({ value }) => {
    if (value > max) throw new ValidationError(`Must be less than ${max}`);
    return value;
  });

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

const stringToNumber = makeRefinement<string, number>(({ value }) => {
  return Number(value);
});

const user = makeRefinement<string, { id: string }>(({ value }) =>
  Promise.resolve({ id: value })
);

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  const expectString = (arg: string) => {
    expect(typeof arg === "string").toBe(true);
  };

  const expectNumber = (arg: number) => {
    expect(typeof arg === "number").toBe(true);
  };

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

    it("should handle async refinements", async () => {
      const s = str.refine(maxLength(6)).refine(minLength(6)).transform(user);
      expect(await s.validateAsync("123456")).toEqual({ id: "123456" });
      expect(() => s.validateSync("123456")).toThrow();
      expect(await s.validateMaybeAsync("123456").await()).toEqual({
        id: "123456",
      });
    });
  });

  describe("MaybePromise", () => {
    it("should work with promises", async () => {
      const prom = new MaybePromise(Promise.resolve("hello"));
      expect(await prom.await()).toEqual("hello");
      expect(() => prom.assertSync()).toThrow();
    });

    it("should work with non promises", async () => {
      const prom = new MaybePromise("hello");
      expect(await prom.await()).toEqual("hello");
      expect(prom.assertSync()).toEqual("hello");
    });

    it("should be thenable", async () => {
      const test = new MaybePromise("hell")
        .then((value) => value + "o")
        .then((value) => value + "!")
        .then((value) => Promise.resolve(value + "!"))
        .then((value) => new MaybePromise(value + "!"));
      expect(await test.await()).toEqual("hello!!!");
    });

    it("should correctly type transformations when then chaining", async () => {
      const test = new MaybePromise(123)
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
          return new MaybePromise(String(value));
        });
      const result: string = await test.await();
      expect(result).toEqual("49");
    });
  });
}
