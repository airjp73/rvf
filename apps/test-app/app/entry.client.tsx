import { RemixBrowser } from "@remix-run/react";
import React from "react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(
  document,
  <React.StrictMode>
    <RemixBrowser />
  </React.StrictMode>
);
