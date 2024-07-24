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

const NavItem = ({ href, children }: { href: string; children: ReactNode }) => {
  let [pathname] = useInitialValue([useLocation().pathname], false);
  const active = href === pathname;

  return (
    <motion.li layout="position" className="relative">
      <NavLink href={href} active={active}>
        {children}
      </NavLink>
    </motion.li>
  );
};

const itemPropsSchema = z
  .object({ children: z.string(), href: z.string() })
  .transform((val) => ({
    href: val.href,
    title: val.children,
  }));

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

  const itemHeight = 28;
  const offset = 2;
  let activePageIndex = groupLinks.findIndex((link) => link === pathname);
  let top = offset + activePageIndex * itemHeight;

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
        <AnimatePresence initial={false}>
          {isGroupActive && !hasChildGroups && (
            <motion.div
              layout
              className="absolute left-2 h-6 w-px bg-fuchsia-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0 }}
              style={{ top }}
            />
          )}
        </AnimatePresence>
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

const navigation = (
  <>
    <NavigationGroup className="md:mt-0" title="Getting started">
      <NavItem href="/">Introduction</NavItem>
      <NavItem href="/installation">Installation</NavItem>
      <NavItem href="/quick-start">Quick start</NavItem>
    </NavigationGroup>
    <NavigationGroup title="Guides">
      <NavItem href="/default-values">Default values</NavItem>
      <NavItem href="/input-types">Different input types</NavItem>
      <NavItem href="/controlled-fields">Controlled fields</NavItem>
      <NavItem href="/arrays-and-nested">Arrays and nested data</NavItem>
      <NavItem href="/validation-library-support">
        Validation library support
      </NavItem>
      <NavItem href="/scoping">Scoped abstractions</NavItem>
      <NavItem href="/state-mode">State mode</NavItem>
      <NavItem href="/supporting-no-js">Support users without JS</NavItem>
    </NavigationGroup>
    <NavigationGroup title="Recipes">
      <NavItem href="/recipes/typesafe-input">Typesafe input component</NavItem>
    </NavigationGroup>
    <NavigationGroup title="Base API Reference">
      <NavigationGroup title="Form API">
        <NavItem href="/reference/use-form">useForm</NavItem>
        <NavItem href="/reference/use-form-scope">useFormScope</NavItem>
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
      <NavigationGroup title="Context">
        <NavItem href="/reference/form-provider">FormProvider</NavItem>
        <NavItem href="/reference/use-form-context">useFormContext</NavItem>
        <NavItem href="/reference/use-form-scope-or-context">
          useFormScopeOrContext
        </NavItem>
      </NavigationGroup>
      <NavigationGroup title="Misc">
        <NavItem href="/reference/use-native-validity">
          useNativeValidity
        </NavItem>
        <NavItem href="/reference/isolate">Isolate</NavItem>
      </NavigationGroup>
    </NavigationGroup>
    <NavigationGroup title="Adapters">
      <NavItem href="/remix">Remix</NavItem>
    </NavigationGroup>
  </>
);

const getFlatNavLinks = (nav: JSX.Element): z.infer<typeof itemPropsSchema>[] =>
  Children.toArray(nav.props.children)
    .filter(isValidElement)
    .flatMap((item) => {
      if (item.type === NavigationGroup) return getFlatNavLinks(item);
      const props = itemPropsSchema.safeParse(item.props);
      if (!props.success) return [];
      return [props.data];
    });

export const flatNavLinks = getFlatNavLinks(navigation);

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
        {navigation}
      </ul>
    </nav>
  );
}
