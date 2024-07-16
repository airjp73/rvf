import { pathArrayToString } from "@rvf/set-get";

const isNonNullish = <T,>(value: T | null | undefined): value is T =>
  value != null;

export const makeImplFactory = <Item,>(
  prefix: string,
  create: (fieldName: string) => Item,
) => {
  const implCache = new Map<string, Item>();

  return (fieldName?: string) => {
    const fullName = pathArrayToString(
      [prefix, fieldName].filter(isNonNullish),
    );

    const existingImpl = implCache.get(fullName);
    if (existingImpl) return existingImpl;

    const impl = create(fieldName ?? "");
    implCache.set(fullName, impl);
    return impl;
  };
};
