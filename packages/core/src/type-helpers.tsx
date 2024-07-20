import { StringToPathTuple, ValidStringPaths, ValueAtPath } from "@rvf/set-get";
import { FormScope } from "./form";

export type ScopedValues<Scope> = Scope extends FormScope<infer U> ? U : never;

export type FieldValue<
  Scope,
  Path extends ValidStringPaths<ScopedValues<Scope>>,
> = ValueAtPath<ScopedValues<Scope>, StringToPathTuple<Path>>;
