import { useFetcher } from "@remix-run/react";
import { createContext } from "react";

export type InternalFormContextValue = {
  formId: string | symbol;
  action?: string;
  subaction?: string;
  defaultValuesProp?: { [fieldName: string]: any };
  fetcher?: ReturnType<typeof useFetcher>;
};

export const InternalFormContext =
  createContext<InternalFormContextValue | null>(null);
