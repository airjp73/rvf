import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import "./tailwind.css";
import { ThemeProvider } from "./ui/theme/themeMachine";
import {
  ThemeScript,
  ThemedHtmlElement,
} from "./ui/theme/theme";
import { Toaster } from "./ui/sonner";

export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ThemedHtmlElement
        lang="en"
        className="h-full"
        suppressHydrationWarning
      >
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <Meta />
          <Links />
        </head>
        <body className="flex min-h-full antialiased bg-background">
          {children}
          <ScrollRestoration />
          <Scripts />
          <ThemeScript />
          <Toaster />
        </body>
      </ThemedHtmlElement>
    </ThemeProvider>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="container flex flex-col gap-4 items-center justify-center h-screen">
          <h1 className="text-3xl">404</h1>
          <p>
            These docs are still in development, so I
            probably haven't added this page yet.
          </p>
        </div>
      );
    }
    return (
      <div className="container flex flex-col gap-4 items-center justify-center h-screen">
        <h1 className="text-3xl">
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="container flex flex-col gap-4 items-center justify-center h-screen">
        <h1 className="text-3xl">Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return (
      <div className="container flex flex-col gap-4 items-center justify-center h-screen">
        <h1 className="text-3xl">Unknown error</h1>
      </div>
    );
  }
}
