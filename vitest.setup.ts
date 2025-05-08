import "@testing-library/jest-dom/vitest";
import { URLSearchParams } from "node:url";

// https://github.com/vitest-dev/vitest/issues/7906
// @ts-expect-error
globalThis.URLSearchParams = URLSearchParams;
