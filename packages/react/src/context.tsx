import { Rvf, scopeRvf } from "@rvf/core";
import {
  createContext,
  type PropsWithChildren,
  useMemo,
  useContext,
  useEffect,
} from "react";
import { useRvf } from "./useRvf";
import { RvfReact } from "./base";
import { useFormScope } from "./useFormScope";

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
  return useFormScope(value.scope) as RvfReact<TData>;
};

export const useFormScopeOrContextInternal = (
  rvfOrName?: Rvf<any> | string,
): Rvf<unknown> => {
  const value = useContext(RvfContext);

  const getRvf = () => {
    if (rvfOrName == null) {
      if (!value)
        throw new Error("useRvfContext must be used within a RvfProvider");
      return value.scope;
    }

    if (typeof rvfOrName !== "string") return rvfOrName;

    if (!value)
      throw new Error("useRvfContext must be used within a RvfProvider");
    return scopeRvf(value.scope, rvfOrName);
  };

  const rvf = getRvf();

  // Flush on every update
  useEffect(() => {
    rvf.__store__.resolvers.flush();
  });

  return rvf;
};

export const useFormScopeOrContext = <TData,>(
  rvf?: Rvf<TData>,
): RvfReact<TData> => {
  const value = useContext(RvfContext);
  const scope = value?.scope ?? rvf;

  if (!scope)
    throw new Error(
      "useFormScopeOrContext must be passed an Rvf or be used within a RvfProvider",
    );

  return useFormScope(scope) as RvfReact<TData>;
};
