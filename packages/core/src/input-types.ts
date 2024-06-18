/**
 * The value of a file input as managed by RVF.
 * Empty file inputs are represented by an empty string.
 */
export type SingleFileInputValue = null | File;

/**
 * The value of a file input with the `multiple` attribute as managed by RVF.
 * Empty file inputs are represented by an empty string.
 */
export type MultiFileInputValue = null | File[];
