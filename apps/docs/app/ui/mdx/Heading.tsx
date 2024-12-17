"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";

function AnchorIcon(
  props: React.ComponentPropsWithoutRef<"svg">,
) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6.5 11.5-.964-.964a3.535 3.535 0 1 1 5-5l.964.964m2 2 .964.964a3.536 3.536 0 0 1-5 5L8.5 13.5m0-5 3 3" />
    </svg>
  );
}

function Anchor({
  id,
  inView,
  children,
}: {
  id: string;
  inView: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={`#${id}`}
      className="group text-inherit no-underline hover:text-inherit"
    >
      {inView && (
        <div className="absolute ml-[calc(-1*var(--width))] mt-1 hidden w-[var(--width)] opacity-0 transition [--width:calc(2.625rem+0.5px+50%-min(50%,calc(theme(maxWidth.lg)+theme(spacing.8))))] group-hover:opacity-100 group-focus:opacity-100 md:block lg:z-50 2xl:[--width:theme(spacing.10)]">
          <div className="group/anchor block h-5 w-5 rounded-lg bg-zinc-50 ring-1 ring-inset ring-zinc-300 transition hover:ring-zinc-500 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-700 dark:hover:ring-zinc-600">
            <AnchorIcon className="h-5 w-5 stroke-zinc-500 transition dark:stroke-zinc-400 dark:group-hover/anchor:stroke-white" />
          </div>
        </div>
      )}
      {children}
    </Link>
  );
}

export function Heading<Level extends 2 | 3>({
  children,
  tag,
  label,
  level,
  anchor = true,
  ...props
}: React.ComponentPropsWithoutRef<`h${Level}`> & {
  id: string;
  tag?: string;
  label?: string;
  level?: Level;
  anchor?: boolean;
}) {
  level = level ?? (2 as Level);
  let Component = `h${level}` as "h2" | "h3";
  let ref = useRef<HTMLHeadingElement>(null);
  // let registerHeading = useSectionStore((s) => s.registerHeading)

  let inView = useInView(ref, {
    margin: `${54}px 0px 0px 0px`,
    amount: "all",
  });

  const location = useLocation();

  return (
    <>
      <Component
        ref={ref}
        className={cn(
          tag || label
            ? "mt-2 scroll-mt-32"
            : "scroll-mt-24",
          location.hash === `#${props.id}` &&
            "text-fuchsia-500 ring-1 ring-offset-4 rounded-md ring-offset-background ring-fuchsia-500",
        )}
        {...props}
      >
        {anchor ? (
          <Anchor id={props.id} inView={inView}>
            {children}
          </Anchor>
        ) : (
          children
        )}
      </Component>
    </>
  );
}
