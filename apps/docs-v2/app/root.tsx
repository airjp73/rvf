import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { ThemeProvider } from "./ui/theme/themeMachine";
import { ThemeScript, ThemedHtmlElement } from "./ui/theme/theme";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedHtmlElement lang="en" className="h-full" suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
          {children}
          <ScrollRestoration />
          <Scripts />
          <ThemeScript />
        </body>
      </ThemedHtmlElement>
    </ThemeProvider>
  );
}

export default function App() {
  return <Outlet />;
}
