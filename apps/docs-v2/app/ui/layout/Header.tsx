import { forwardRef } from "react";
import { Link } from "@remix-run/react";
import clsx from "clsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeToggle } from "../theme/theme";

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

const GithubIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>GitHub</title>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

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
        "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80",
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
          "absolute inset-x-0 top-full h-px transition",
          // (isInsideMobileNavigation || !mobileNavIsOpen) &&
          //   "bg-zinc-900/7.5 dark:bg-white/7.5",
        )}
      />
      {/* <Search /> */}
      <div className="flex items-center gap-5 lg:hidden">
        {/* <MobileNavigation /> */}
        <Link to="/" aria-label="Home">
          Logo
          {/* <Logo className="h-6" /> */}
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
        <div className="hidden min-[416px]:contents">
          {/* <Button href="#">Sign in</Button> */}
        </div>
      </div>
    </motion.div>
  );
});
