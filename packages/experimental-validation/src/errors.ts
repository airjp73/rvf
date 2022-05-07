import { AnyMeta } from "./core";

type MetaFunc = (meta: AnyMeta) => string;
type LabelFunc = (label: string) => string;

export type ErrorMessage = string | MetaFunc;

export const errorMessage =
  (
    provided: string | MetaFunc | undefined,
    metaKey: symbol,
    withLabel: LabelFunc,
    fallback: string
  ) =>
  (_: unknown, meta: AnyMeta) => {
    // If the user provides an error, use it
    if (typeof provided === "function") return provided(meta);
    if (typeof provided === "string") return provided;

    // If there's an error inside meta, use that
    if (typeof meta[metaKey] === "function") return meta[metaKey](meta);
    if (typeof meta[metaKey] === "string") return meta[metaKey];

    // If there's a label in meta, we can use that
    if ("label" in meta) return withLabel(meta.label);

    // Otherwise, use the fallback
    return fallback;
  };
