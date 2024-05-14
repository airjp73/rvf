export type FormControl =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export const isFormControl = (el: EventTarget): el is FormControl =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLSelectElement ||
  el instanceof HTMLTextAreaElement;
