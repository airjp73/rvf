import { StrictMode } from "react";
import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

hydrate(
  <StrictMode>
    <RemixBrowser />
  </StrictMode>,
  document
);
