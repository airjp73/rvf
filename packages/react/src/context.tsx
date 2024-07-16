import { FormScope, scopeFormScope } from "@rvf/core";
import {
  createContext,
  type PropsWithChildren,
  useMemo,
  useContext,
  useEffect,
} from "react";
import { FormApi } from "./base";
import { useFormScope } from "./useFormScope";

type FormContextValue = {
  scope: FormScope<unknown>;
};

const FormContext = createContext<FormContextValue | null>(null);

export type FormProviderProps = {
  scope: FormScope<any>;
};

export const FormProvider = ({
  scope,
  children,
}: PropsWithChildren<FormProviderProps>) => {
  const value = useMemo(() => ({ scope }), [scope]);
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useFormContext = <TData,>() => {
  const value = useContext(FormContext);
  if (!value)
    throw new Error("useFormContext must be used within a FormProvider");
  return useFormScope(value.scope) as FormApi<TData>;
};

export const useFormScopeOrContextInternal = (
  rvfOrName?: FormScope<any> | string,
): FormScope<unknown> => {
  const value = useContext(FormContext);

  const getFormScope = () => {
    if (rvfOrName == null) {
      if (!value)
        throw new Error("useFormContext must be used within a FormProvider");
      return value.scope;
    }

    if (typeof rvfOrName !== "string") return rvfOrName;

    if (!value)
      throw new Error("useFormContext must be used within a FormProvider");
    return scopeFormScope(value.scope, rvfOrName);
  };

  const rvf = getFormScope();

  // Flush on every update
  useEffect(() => {
    rvf.__store__.resolvers.flush();
  });

  return rvf;
};

export const useFormScopeOrContext = <TData,>(
  rvf?: FormScope<TData>,
): FormApi<TData> => {
  const value = useContext(FormContext);
  const scope = value?.scope ?? rvf;

  if (!scope)
    throw new Error(
      "useFormScopeOrContext must be passed an FormScope or be used within a FormProvider",
    );

  return useFormScope(scope) as FormApi<TData>;
};
