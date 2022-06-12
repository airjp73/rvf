export type PossiblyPromise<T> = T | Promise<T> | MaybePromise<T>;

type AwaitedArray<T extends any[]> = {
  [K in keyof T]: Awaited<T[K]>;
};

type AwaitableArray<T extends any[]> = {
  [K in keyof T]: PossiblyPromise<T[K]>;
};

type MaybePromiseResult<T> =
  | { type: "promise"; promise: Promise<T> }
  | { type: "value"; value: T }
  | { type: "error"; error: unknown };

type MaybePromises<T extends any[]> = {
  [K in keyof T]: MaybePromise<T[K]>;
};

const wrapArray = <Values extends any[]>(
  maybes: MaybePromises<Values>
): MaybePromise<Values> => {
  let cur = MaybePromise.of(() => [] as any);
  for (const maybe of maybes) {
    cur = cur.then((acc) => maybe.then((value: any) => [...acc, value]));
  }
  return cur;
};

type MaybePromiseSettledResult<T = unknown, E = unknown> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: E };

type SettledResults<T extends any[]> = {
  [K in keyof T]: MaybePromiseSettledResult<T[K]>;
};

export class MaybePromise<T> {
  static allSettled<Values extends unknown[]>(
    values: AwaitableArray<Values>
  ): MaybePromise<SettledResults<Values>> {
    const resultMaybes = values
      .map((val) => MaybePromise.of(() => val))
      .map((val) =>
        val
          .then(
            (success): MaybePromiseSettledResult => ({
              status: "fulfilled",
              value: success,
            })
          )
          .catch(
            (err): MaybePromiseSettledResult => ({
              status: "rejected",
              reason: err,
            })
          )
      );
    return wrapArray(resultMaybes) as MaybePromise<SettledResults<Values>>;
  }

  static of<Value>(func: () => PossiblyPromise<Value>): MaybePromise<Value> {
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

  updateError = (makeNewError: (err: unknown) => unknown): MaybePromise<T> => {
    if (this._result.type === "value") return this;

    if (this._result.type === "promise") {
      return this;
    }

    const { error } = this._result;
    return MaybePromise.of(() => {
      throw makeNewError(error);
    });
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
