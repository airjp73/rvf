"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useRef,
} from "react";
import { Link, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { z } from "zod";

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current;
  return condition ? initialValue : value;
}

export function TopLevelNavItem({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li>
      <Link
        to={href}
        className={cn(
          "text-sm leading-5 text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex gap-2 items-center",
          className,
        )}
      >
        {children}
      </Link>
    </li>
  );
}

function NavLink({
  href,
  children,
  active = false,
  isAnchorLink = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  isAnchorLink?: boolean;
}) {
  return (
    <Link
      to={href}
      prefetch="intent"
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex justify-between gap-2 py-1 pr-3 text-sm transition",
        isAnchorLink ? "pl-7" : "pl-4",
        active
          ? "text-zinc-900 dark:text-white"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
      )}
    >
      <span className="truncate">{children}</span>
    </Link>
  );
}

const NavItem = ({
  href,
  children,
  isGroupActive = false,
}: {
  href: string;
  children: ReactNode;
  isGroupActive?: boolean;
}) => {
  let [pathname] = useInitialValue([useLocation().pathname], false);
  const active = href === pathname;

  return (
    <motion.li layout="position" className="relative">
      <AnimatePresence custom={isGroupActive} initial={false}>
        {isGroupActive && (
          <motion.div
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
          >
            {active && (
              <motion.div
                layoutId="active-indicator"
                className="absolute left-0 h-full w-px bg-fuchsia-500"
                custom={isGroupActive}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <NavLink href={href} active={active}>
        {children}
      </NavLink>
    </motion.li>
  );
};

const itemPropsSchema = z.object({ href: z.string() });

function NavigationGroup({
  title,
  className,
  children,
  level = 1,
}: PropsWithChildren<{
  title: string;
  className?: string;
  level?: number;
}>) {
  let [pathname] = useInitialValue([useLocation().pathname], false);
  const validChildren = Children.toArray(children).filter(isValidElement);
  const groupLinks = validChildren
    .map((child) => itemPropsSchema.safeParse(child.props))
    .filter((r) => r.success)
    .map((r) => r.data.href);
  const isGroupActive = groupLinks.includes(pathname);

  const hasChildGroups = validChildren.some(
    (child) => child.type === NavigationGroup,
  );

  return (
    <li
      className={clsx(
        "relative",
        level === 1 && "mt-6",
        level === 2 && "mt-3",
        className,
      )}
    >
      {level === 1 && (
        <motion.h2
          layout="position"
          className="text-sm font-semibold text-zinc-900 dark:text-white"
        >
          {title}
        </motion.h2>
      )}
      {level === 2 && (
        <motion.h3
          layout="position"
          className="text-xs font-semibold text-zinc-900 dark:text-white"
        >
          {title}
        </motion.h3>
      )}
      <div className="relative mt-3 pl-2">
        {!hasChildGroups && (
          <motion.div
            layout
            className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
          />
        )}
        <ul role="list" className="border-l border-transparent">
          <LayoutGroup id={title}>
            {validChildren.map((child) =>
              cloneElement(child, { isGroupActive, level: level + 1 } as never),
            )}
          </LayoutGroup>
        </ul>
      </div>
    </li>
  );
}

export function Navigation({
  children,
  topLevelItems,
  ...props
}: React.ComponentPropsWithoutRef<"nav"> & { topLevelItems?: ReactNode }) {
  return (
    <nav {...props}>
      {children}
      <ul role="list">
        {topLevelItems}
        <NavigationGroup className="md:mt-0" title="Getting started">
          <NavItem href="/">Introduction</NavItem>
          <NavItem href="/installation">Installation</NavItem>
          <NavItem href="/quick-start">Quick start</NavItem>
        </NavigationGroup>
        <NavigationGroup title="Guides">
          <NavItem href="/default-values">Default values</NavItem>
          <NavItem href="/input-types">Different input types</NavItem>
          <NavItem href="/arrays-and-nested">Arrays and nested data</NavItem>
          <NavItem href="/validation-library-support">
            Validation library support
          </NavItem>
          <NavItem href="/scoping">Scoped abstractions</NavItem>
          <NavItem href="/state-mode">State mode</NavItem>
          <NavItem href="/supporting-no-js">Support users without JS</NavItem>
        </NavigationGroup>
        <NavigationGroup title="Recipes">
          <NavItem href="/recipes/typesafe-input">
            Typesafe input component
          </NavItem>
        </NavigationGroup>
        <NavigationGroup title="Base API Reference">
          <NavigationGroup title="Form API">
            <NavItem href="/reference/use-form">useForm</NavItem>
            <NavItem href="/reference/validated-form">ValidatedForm</NavItem>
            <NavItem href="/reference/form-api">FormApi</NavItem>
          </NavigationGroup>
          <NavigationGroup title="Field API">
            <NavItem href="/reference/use-field">useField</NavItem>
            <NavItem href="/reference/field">Field</NavItem>
            <NavItem href="/reference/field-api">FieldApi</NavItem>
          </NavigationGroup>
          <NavigationGroup title="Field Array API">
            <NavItem href="/reference/use-field-array">useFieldArray</NavItem>
            <NavItem href="/reference/field-array">FieldArray</NavItem>
            <NavItem href="/reference/field-array-api">FieldArrayApi</NavItem>
          </NavigationGroup>
        </NavigationGroup>
        <NavigationGroup title="Adapters">
          <NavItem href="/remix">Remix</NavItem>
        </NavigationGroup>
      </ul>
    </nav>
  );
}
