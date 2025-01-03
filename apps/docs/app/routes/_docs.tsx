import { Link, Outlet } from "react-router";
import { motion } from "framer-motion";
import { Logo } from "~/ui/branding/Logo";
import { Footer } from "~/ui/layout/Footer";
import { Header } from "~/ui/layout/Header";
import { Navigation } from "~/ui/layout/Navigation";

export default function DocsLayout() {
  return (
    <div className="w-full">
      <div className="h-full lg:ml-72 xl:ml-80">
        <motion.header
          layoutScroll
          className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex"
        >
          <div className="contents lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-6 lg:pb-8 lg:pt-4 xl:w-80 lg:dark:border-white/10">
            <div className="hidden lg:flex">
              <Link to="/" aria-label="Home">
                <Logo className="h-8" />
              </Link>
            </div>
            <Header />
            <Navigation className="hidden lg:mt-10 lg:block" />
          </div>
        </motion.header>
        <div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8">
          <main className="flex-auto">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
