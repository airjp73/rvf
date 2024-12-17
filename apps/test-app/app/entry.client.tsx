import { HydratedRouter } from "react-router/dom";
import React from "react";
import { hydrate } from "react-dom";

// TODO: Switch to hydrateRoot when possible
// https://github.com/remix-run/remix/issues/2570
hydrate(
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>,
  document,
);
