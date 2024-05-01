import { Rvf } from "@rvf/core";
import {
  createContext,
  type PropsWithChildren,
  useMemo,
  useContext,
} from "react";
import { RvfReact, useRvf } from "./react";

type RvfContextValue = {
  scope: Rvf<unknown>;
};

const RvfContext = createContext<RvfContextValue | null>(null);

export type RvfProviderProps = {
  scope: Rvf<any>;
};

export const RvfProvider = ({
  scope,
  children,
}: PropsWithChildren<RvfProviderProps>) => {
  const value = useMemo(() => ({ scope }), [scope]);
  return <RvfContext.Provider value={value}>{children}</RvfContext.Provider>;
};

export const useRvfContext = <TData,>() => {
  const value = useContext(RvfContext);
  if (!value)
    throw new Error("useRvfContext must be used within a RvfProvider");
  return useRvf(value.scope) as RvfReact<TData>;
};

/**
 * This is an internal helper for adapters to implement custom logic around context.
 */
export const INTERNAL_USE_RVF_CONTEXT_RAW = () => {
  return useContext(RvfContext);
};
