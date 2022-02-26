import { Atom, atom } from "jotai";
import { atomFamily } from "jotai/utils";
import isEqual from "lodash/isEqual";

export type InternalFormId = string | symbol;

export const formAtomFamily = <T>(data: T) =>
  atomFamily((_: InternalFormId) => atom(data));

export type FieldAtomKey = { formId: InternalFormId; field: string };
export const fieldAtomFamily = <T extends Atom<unknown>>(
  func: (key: FieldAtomKey) => T
) => atomFamily(func, isEqual);
