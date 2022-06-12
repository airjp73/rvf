import { expect } from "vitest";

export const expectString = (arg: string) => {
  expect(typeof arg === "string").toBe(true);
};

export const expectNumber = (arg: number) => {
  expect(typeof arg === "number").toBe(true);
};

// Only tests the types
export const expectType = <T>(arg: T) => {};
