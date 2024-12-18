import { Immer } from "immer";
import { StateCreator } from "zustand";
import type { immer as immerMiddleware } from "zustand/middleware/immer";

// react-tracked and immer conflict sometimes because of auto-freezing.
// In order to fix this, we'll turn of fauto-freezing just for our usage of immer.
const immerInstance = new Immer({
  autoFreeze: false,
});

/**
 * Zustand doesn't provide an option to customize the immer instance,
 * so we've copy-pasted the implementation from zustand/middleware/immer.ts
 * https://github.com/pmndrs/zustand/blob/main/src/middleware/immer.ts
 */

type ImmerImpl = <T>(
  storeInitializer: StateCreator<T, [], []>,
) => StateCreator<T, [], []>;

const immerImpl: ImmerImpl = (initializer) => (set, get, store) => {
  type T = ReturnType<typeof initializer>;

  store.setState = (updater, replace, ...a) => {
    const nextState = (
      typeof updater === "function"
        ? immerInstance.produce(updater as any)
        : updater
    ) as ((s: T) => T) | T | Partial<T>;

    return set(nextState as any, replace as any, ...a);
  };

  return initializer(store.setState, get, store);
};

export const immer = immerImpl as unknown as typeof immerMiddleware;
