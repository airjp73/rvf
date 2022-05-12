import { RemixBrowser } from "@remix-run/react";
import React from "react";
import { hydrate } from "react-dom";
import { hydrateRoot } from "react-dom/client";

// hydrateRoot(
//   document,
//   <React.StrictMode>
//     <RemixBrowser />
//   </React.StrictMode>
// );

// TODO: Switch to hydrateRoot when possible
// https://github.com/remix-run/remix/issues/2570
hydrate(
  <React.StrictMode>
    <RemixBrowser />
  </React.StrictMode>,
  document
);
