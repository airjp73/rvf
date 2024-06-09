import { Rvf, scopeRvf } from "@rvf/core";
import {
  createContext,
  type PropsWithChildren,
  useMemo,
  useContext,
  useEffect,
} from "react";
import { RvfReact } from "./base";
import { useFormScope } from "./useFormScope";

type FormContextValue = {
  scope: Rvf<unknown>;
};

const RvfContext = createContext<FormContextValue | null>(null);

export type FormProviderProps = {
  scope: Rvf<any>;
};

export const FormProvider = ({
  scope,
  children,
}: PropsWithChildren<FormProviderProps>) => {
  const value = useMemo(() => ({ scope }), [scope]);
  return <RvfContext.Provider value={value}>{children}</RvfContext.Provider>;
};

export const useFormContext = <TData,>() => {
  const value = useContext(RvfContext);
  if (!value)
    throw new Error("useFormContext must be used within a FormProvider");
  return useFormScope(value.scope) as RvfReact<TData>;
};

export const useFormScopeOrContextInternal = (
  rvfOrName?: Rvf<any> | string,
): Rvf<unknown> => {
  const value = useContext(RvfContext);

  const getRvf = () => {
    if (rvfOrName == null) {
      if (!value)
        throw new Error("useFormContext must be used within a FormProvider");
      return value.scope;
    }

    if (typeof rvfOrName !== "string") return rvfOrName;

    if (!value)
      throw new Error("useFormContext must be used within a FormProvider");
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
      "useFormScopeOrContext must be passed an Rvf or be used within a FormProvider",
    );

  return useFormScope(scope) as RvfReact<TData>;
};
