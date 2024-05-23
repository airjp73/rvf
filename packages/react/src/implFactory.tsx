import { pathArrayToString } from "set-get";
import * as R from "remeda";

export const makeImplFactory = <Item,>(
  prefix: string,
  create: (fieldName: string) => Item,
) => {
  const implCache = new Map<string, Item>();

  return (fieldName?: string) => {
    const fullName = pathArrayToString(
      [prefix, fieldName].filter(R.isNonNullish),
    );

    const existingImpl = implCache.get(fullName);
    if (existingImpl) return existingImpl;

    const impl = create(fullName);
    implCache.set(fullName, impl);
    return impl;
  };
};
