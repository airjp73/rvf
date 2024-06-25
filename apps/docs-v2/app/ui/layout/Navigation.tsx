"use client";

import { ReactNode, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { useMobileNavigationStore } from "./MobileNavigation";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

interface NavGroup {
  title: string;
  links: Array<{
    title: string;
    href: string;
  }>;
}

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

// function VisibleSectionHighlight({
//   group,
//   pathname,
// }: {
//   group: NavGroup;
//   pathname: string;
// }) {
//   let [sections, visibleSections] = useInitialValue(
//     [
//       useSectionStore((s) => s.sections),
//       useSectionStore((s) => s.visibleSections),
//     ],
//     useIsInsideMobileNavigation()
//   );

//   let isPresent = useIsPresent();
//   let firstVisibleSectionIndex = Math.max(
//     0,
//     [{ id: "_top" }, ...sections].findIndex(
//       (section) => section.id === visibleSections[0]
//     )
//   );
//   let itemHeight = remToPx(2);
//   let height = isPresent
//     ? Math.max(1, visibleSections.length) * itemHeight
//     : itemHeight;
//   let top =
//     group.links.findIndex((link) => link.href === pathname) * itemHeight +
//     firstVisibleSectionIndex * itemHeight;

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1, transition: { delay: 0.2 } }}
//       exit={{ opacity: 0 }}
//       className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
//       style={{ borderRadius: 8, height, top }}
//     />
//   );
// }

function ActivePageMarker({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  let itemHeight = 32;
  let offset = 4;
  let activePageIndex = group.links.findIndex((link) => link.href === pathname);
  let top = offset + activePageIndex * itemHeight;

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-fuchsia-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  );
}

function NavigationGroup({
  group,
  className,
}: {
  group: NavGroup;
  className?: string;
}) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  // let isInsideMobileNavigation = useIsInsideMobileNavigation();
  let [pathname] = useInitialValue([useLocation().pathname], false);

  let isActiveGroup =
    group.links.findIndex((link) => link.href === pathname) !== -1;

  return (
    <li className={clsx("relative mt-6", className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        {/* <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={pathname} />
          )}
        </AnimatePresence> */}
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === pathname}>
                {link.title}
              </NavLink>
              {/* <AnimatePresence mode="popLayout" initial={false}>
                {link.href === pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink
                          href={`${link.href}#${section.id}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence> */}
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export const navigation: Array<NavGroup> = [
  {
    title: "Getting started",
    links: [
      { title: "Introduction", href: "/" },
      { title: "Installation", href: "/installation" },
      { title: "Quick start", href: "/quick-start" },
    ],
  },
  {
    title: "Guides",
    links: [
      { title: "Arrays and nested data", href: "/arrays-and-nested" },
      { title: "Different input types", href: "/input-types" },
      {
        title: "Scoped abstractions",
        href: "/scoping",
      },
    ],
  },
  {
    title: "Recipes",
    links: [
      { title: "Typesafe input component", href: "/recipes/typesafe-input" },
    ],
  },
];

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
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? "md:mt-0" : ""}
          />
        ))}
      </ul>
    </nav>
  );
}
