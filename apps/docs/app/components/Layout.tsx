import {
  HomeIcon,
  MenuAlt2Icon,
  AcademicCapIcon,
} from "@heroicons/react/outline";
import { CalendarIcon, CurrencyDollarIcon } from "@heroicons/react/solid";
import { FC, useEffect, useState } from "react";
import { useMatches } from "remix";
import { Sidebar } from "../components/Sidebar";

export const Layout: FC = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = (
    <>
      <Sidebar.NavItem label="Home" to="/teacher" icon={<HomeIcon />} end />
      <Sidebar.NavItem
        label="Schedule"
        to="/teacher/schedule"
        icon={<CalendarIcon />}
      />
      <Sidebar.NavItem
        label="Students"
        to="/teacher/students"
        icon={<AcademicCapIcon />}
      />
      <Sidebar.NavItem
        label="Accounts"
        to="/teacher/accounts"
        icon={<CurrencyDollarIcon />}
      />
    </>
  );

  const matches = useMatches();
  useEffect(() => console.log(matches), [matches]);

  return (
    <div className="h-screen flex overflow-hidden bg-zinc-100">
      <Sidebar.SlideOut
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        {navItems}
      </Sidebar.SlideOut>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar>{navItems}</Sidebar>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden bg-zinc-800">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-zinc-700 md:hidden items-center">
          <button
            type="button"
            className="px-4 border-r border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <header>
            <h1 className="text-xl text-zinc-300 font-bold px-8 py-4 whitespace-nowrap">
              Remix Validated Form
            </h1>
          </header>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none prose prose-invert p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
