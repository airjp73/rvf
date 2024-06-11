import { forwardRef } from "react";
import { Link } from "@remix-run/react";
import clsx from "clsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeToggle } from "../theme/theme";
import { Logo } from "../branding/Logo";
import { GithubIcon } from "../icons/GithubIcon";

// import {
//   MobileNavigation,
//   useIsInsideMobileNavigation,
// } from '@/components/MobileNavigation'
// import { useMobileNavigationStore } from '@/components/MobileNavigation'
// import { MobileSearch, Search } from '@/components/Search'
// import { ThemeToggle } from '@/components/ThemeToggle'

function TopLevelNavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={href}
        className="text-sm leading-5 text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex gap-2 items-center"
      >
        {children}
      </Link>
    </li>
  );
}

export const Header = forwardRef<
  React.ElementRef<"div">,
  { className?: string }
>(function Header({ className }, ref) {
  // let { isOpen: mobileNavIsOpen } = useMobileNavigationStore()
  // let isInsideMobileNavigation = useIsInsideMobileNavigation()

  let { scrollY } = useScroll();
  let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.9]);
  let bgOpacityDark = useTransform(scrollY, [0, 72], [0.2, 0.8]);

  return (
    <motion.div
      ref={ref}
      className={clsx(
        className,
        "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80"
        // !isInsideMobileNavigation &&
        //   'backdrop-blur-sm lg:left-72 xl:left-80 dark:backdrop-blur',
        // isInsideMobileNavigation
        //   ? 'bg-white dark:bg-zinc-900'
        //   : 'bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]',
      )}
      style={
        {
          "--bg-opacity-light": bgOpacityLight,
          "--bg-opacity-dark": bgOpacityDark,
        } as React.CSSProperties
      }
    >
      <div
        className={clsx(
          "absolute inset-x-0 top-full h-px transition"
          // (isInsideMobileNavigation || !mobileNavIsOpen) &&
          //   "bg-zinc-900/7.5 dark:bg-white/7.5",
        )}
      />
      {/* <Search /> */}
      <div className="flex items-center gap-5 lg:hidden">
        {/* <MobileNavigation /> */}
        <Link to="/" aria-label="Home">
          <Logo className="h-6" />
        </Link>
      </div>
      <div className="flex items-center gap-5 ml-auto">
        <nav className="hidden md:block">
          <ul role="list" className="flex items-center gap-8">
            <TopLevelNavItem href="https://www.github.com/airjp73/remix-validated-form">
              <GithubIcon className="size-4 fill-current" /> Github
            </TopLevelNavItem>
          </ul>
        </nav>
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <div className="flex gap-4">
          {/* <MobileSearch /> */}

          <ThemeToggle buttonVariant="ghost" />
        </div>
      </div>
    </motion.div>
  );
});
