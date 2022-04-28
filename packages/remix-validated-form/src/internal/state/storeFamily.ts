/**
 * This is basically what `atomFamily` from jotai does,
 * but it doesn't make sense to include the entire jotai library just for that api.
 */

export type InternalFormId = string | symbol;

export const storeFamily = <T>(create: () => T) => {
  const stores: Map<InternalFormId, T> = new Map();

  const family = (formId: InternalFormId) => {
    if (stores.has(formId)) return stores.get(formId)!;

    const store = create();
    stores.set(formId, store);
    return store;
  };

  family.remove = (formId: InternalFormId) => {
    stores.delete(formId);
  };

  return family;
};
