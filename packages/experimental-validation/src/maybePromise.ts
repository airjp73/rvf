export type PossiblyPromise<T> = T | Promise<T> | MaybePromise<T>;

export type AwaitedArray<T extends any[]> = {
  [K in keyof T]: Awaited<T[K]>;
};

export type AwaitableArray<T extends any[]> = {
  [K in keyof T]: PossiblyPromise<T[K]>;
};

export type MaybePromiseResult<T> =
  | { type: "promise"; promise: Promise<T> }
  | { type: "value"; value: T }
  | { type: "error"; error: unknown };

export class MaybePromise<T> {
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
