import type {
  MetaFunction,
  LinksFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import codeExampleTheme from "highlight.js/styles/atom-one-dark.css";
import { Layout } from "./components/Layout";
import stylesUrl from "./styles/index.css";

export const meta: MetaFunction = () => {
  return { title: "Remix Validated Form documentation" };
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: codeExampleTheme },
  {
    rel: "icon",
    href: "/favicon.png",
    type: "image/png",
    sizes: "any",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col md:flex-row bg-zinc-800">
        <Layout>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
