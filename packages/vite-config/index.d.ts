import type { UserConfigExport } from "vite";

type ConfigOptions = {
  lib: string;
  external: string | string[];
  dir: string;
};

export function makeConfig(opts: ConfigOptions): UserConfigExport;
