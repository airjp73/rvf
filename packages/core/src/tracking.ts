import { getUntrackedObject } from "react-tracked";

export const getOriginalObject = <T>(obj: T): T => getUntrackedObject(obj) as T;
