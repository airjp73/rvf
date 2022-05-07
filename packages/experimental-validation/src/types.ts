/**
 * Improves readability of the tooltip for object intersections.
 * Instead of { a: string } & { b: string } you can get { a: string, b: string }
 */
export type MergeIntersection<T> = {} & { [K in keyof T]: T[K] };
export type Merge<T, U> = MergeIntersection<Omit<T, keyof U> & U>;
