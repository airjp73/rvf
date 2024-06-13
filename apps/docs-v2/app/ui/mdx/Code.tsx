"use client";

import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import { TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import clsx from "clsx";
import { cn } from "~/lib/utils";

function ClipboardIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path
        strokeWidth="0"
        d="M5.5 13.5v-5a2 2 0 0 1 2-2l.447-.894A2 2 0 0 1 9.737 4.5h.527a2 2 0 0 1 1.789 1.106l.447.894a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2Z"
      />
      <path
        fill="none"
        strokeLinejoin="round"
        d="M12.5 6.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2m5 0-.447-.894a2 2 0 0 0-1.79-1.106h-.527a2 2 0 0 0-1.789 1.106L7.5 6.5m5 0-1 1h-3l-1-1"
      />
    </svg>
  );
}

export function CopyButton({ content }: { content: string }) {
  let [copyCount, setCopyCount] = useState(0);
  let copied = copyCount > 0;

  useEffect(() => {
    if (copyCount > 0) {
      let timeout = setTimeout(() => setCopyCount(0), 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [copyCount]);

  return (
    <button
      type="button"
      className={clsx(
        "group/button absolute right-4 top-3.5 overflow-hidden rounded-full py-1 pl-2 pr-3 text-2xs font-medium opacity-0 backdrop-blur transition focus:opacity-100 group-hover:opacity-100",
        copied
          ? "bg-fuchsia-400/10 ring-1 ring-inset ring-fuchsia-400/20"
          : "bg-white/5 hover:bg-white/7.5 dark:bg-white/2.5 dark:hover:bg-white/5"
      )}
      onClick={() => {
        window.navigator.clipboard.writeText(content).then(() => {
          setCopyCount((count) => count + 1);
        });
      }}
    >
      <span
        aria-hidden={copied}
        className={clsx(
          "pointer-events-none flex items-center gap-0.5 text-zinc-400 transition duration-300",
          copied && "-translate-y-1.5 opacity-0"
        )}
      >
        <ClipboardIcon className="h-5 w-5 fill-zinc-500/20 stroke-zinc-500 transition-colors group-hover/button:stroke-zinc-400" />
        Copy
      </span>
      <span
        aria-hidden={!copied}
        className={clsx(
          "pointer-events-none absolute inset-0 flex items-center justify-center text-fuchsia-400 transition duration-300",
          !copied && "translate-y-1.5 opacity-0"
        )}
      >
        Copied!
      </span>
    </button>
  );
}

export function CodePanel({
  children,
  copyButton,
  value,
}: {
  children: React.ReactNode;
  copyButton?: React.ReactNode;
  value: string;
}) {
  return (
    <TabsContent value={value}>
      <div className="group dark:bg-white/2.5">
        <div className="relative">
          {children}
          {copyButton}
        </div>
      </div>
    </TabsContent>
  );
}

export function CodeHeader({
  title,
  tabs,
}: {
  title: string;
  tabs?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(theme(spacing.12)+1px)] flex-wrap items-start gap-x-4 border-b border-zinc-400 bg-zinc-100 px-4 dark:border-zinc-800 dark:bg-transparent">
      {title && (
        <h3 className="mr-auto pt-3 text-xs font-semibold text-blck dark:text-white">
          {title}
        </h3>
      )}{" "}
      {tabs}
    </div>
  );
}

export const CodeTabsList = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof TabsList>) => (
  <TabsList
    className={cn("-mb-px flex gap-4 text-xs font-medium", className)}
    {...rest}
  />
);

export const CodeTabsTrigger = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof TabsTrigger>) => (
  <TabsTrigger
    className={cn(
      "border-b py-3 transition ui-not-focus-visible:outline-none",
      "data-[state=active]:border-fuchsia-500 data-[state=active]:text-fuchsia-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300",
      className
    )}
    {...rest}
  />
);

export function ExampleArea({
  children,
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-md dark:ring-1 dark:ring-white/10 not-prose [&_pre]:rounded-none [&_pre]:my-0",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Code({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  if (typeof children === "string") {
    return <code {...props} dangerouslySetInnerHTML={{ __html: children }} />;
  }

  return <code {...props}>{children}</code>;
}

export function Pre({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      {...props}
      className="not-prose shiki border border-border whitespace-pre-wrap p-3 text-xs rounded-md my-6"
    >
      {children}
    </pre>
  );
}
