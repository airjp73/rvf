import { createRequestHandler } from "@react-router/express";
import express from "express";
import { createContext, RouterContextProvider } from "react-router";

export const valueFromVercelContext = createContext<string>();

const app = express();

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      const context = new RouterContextProvider();
      context.set(valueFromVercelContext, "Hello from Vercel");
      return context;
    },
  }),
);

export default app;
