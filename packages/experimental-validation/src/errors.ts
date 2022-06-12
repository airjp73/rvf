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

type ValidationErrorInfo = {
  message: string;
  pathSegments?: (string | number)[];
};

export class ValidationError extends Error {
  public readonly pathSegments: (string | number)[];

  constructor({ message, pathSegments = [] }: ValidationErrorInfo) {
    super(message);
    this.name = "ValidationError";
    this.pathSegments = pathSegments;
  }

  copy = (overwriteInfo?: Partial<ValidationErrorInfo>): ValidationErrorInfo =>
    new ValidationError({
      ...this,
      ...overwriteInfo,
    });

  prependPath(path: string) {
    return this.copy({ pathSegments: [path, ...this.pathSegments] });
  }

  getPathString() {
    return this.pathSegments.reduce((acc, segment) => {
      if (typeof segment === "number") return `${acc}[${segment}]`;
      if (acc === "") return segment;
      return `${acc}.${segment}`;
    }, "");
  }
}
