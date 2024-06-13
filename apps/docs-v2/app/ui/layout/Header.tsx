import { forwardRef } from "react";
import { Link } from "@remix-run/react";
import clsx from "clsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeToggle } from "../theme/theme";
import { Logo } from "../branding/Logo";
import { GithubIcon } from "../icons/GithubIcon";
import { MobileNavigation } from "./MobileNavigation";
import { TopLevelNavItem } from "./Navigation";

export const Header = forwardRef<
  React.ElementRef<"div">,
  { className?: string }
>(function Header({ className }, ref) {
  let { scrollY } = useScroll();
  let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.7]);
  let bgOpacityDark = useTransform(scrollY, [0, 72], [0.2, 0.8]);

  return (
    <motion.div
      ref={ref}
      className={clsx(
        className,
        "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80",
        "backdrop-blur-sm lg:left-72 xl:left-80 dark:backdrop-blur",
        "bg-white/[var(--bg-opacity-light)] dark:bg-zinc-950/[var(--bg-opacity-dark)]",
        "border-b border-zinc-900/25 dark:border-zinc-100/15"
      )}
      style={
        {
          "--bg-opacity-light": bgOpacityLight,
          "--bg-opacity-dark": bgOpacityDark,
        } as React.CSSProperties
      }
    >
      <div className={clsx("absolute inset-x-0 top-full h-px transition")} />
      <div className="flex items-center gap-5 lg:hidden">
        <MobileNavigation />
        <Link to="/" aria-label="Home">
          <Logo className="h-8" />
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
