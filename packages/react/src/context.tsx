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

export const useRvfOrContext = <TData,>(rvf?: Rvf<TData>): RvfReact<TData> => {
  const value = useContext(RvfContext);
  const scope = value?.scope ?? rvf;

  if (!scope)
    throw new Error(
      "useRvfOrContext must be passed an Rvf or be used within a RvfProvider",
    );

  return useRvf(scope) as RvfReact<TData>;
};
