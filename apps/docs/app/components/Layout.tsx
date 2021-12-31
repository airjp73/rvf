import { MenuAlt2Icon } from "@heroicons/react/outline";
import React, { FC, Fragment, useState } from "react";
import { useMatches } from "remix";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "./Footer";

type Section = {
  header: string;
  navItems: React.ComponentProps<typeof Sidebar.NavItem>[];
};
const navSections: Section[] = [
  {
    header: "Guides",
    navItems: [
      { label: "Demo", to: "/", end: true },
      { label: "Installation", to: "/installation" },
      {
        label: "Integrate your components",
        to: "/integrate-your-components",
      },
      {
        label: "Server Validation",
        to: "/server-validation",
      },
      { label: "Default Values", to: "/default-values" },
      {
        label: "Arrays and nested data",
        to: "/arrays-and-nested",
      },
      {
        label: "Validation library support",
        to: "/validation-library-support",
      },
    ],
  },
  {
    header: "Api Reference",
    navItems: [
      {
        label: "ValidatedForm",
        to: "/reference/validated-form",
      },
      {
        label: "useField",
        to: "/reference/use-field",
      },
      {
        label: "useIsSubmitting",
        to: "/reference/use-is-submitting",
      },
      {
        label: "useFormContext",
        to: "/reference/use-form-context",
      },
      {
        label: "validationError",
        to: "/reference/validation-error",
      },
    ],
  },
];

export const Layout: FC = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const matches = useMatches();
  const flatNavItems = navSections.flatMap(
    (section) => section.navItems
  );
  const activeNavIndex = flatNavItems.findIndex(
    (item) =>
      matches[matches.length - 1].pathname === item.to
  );
  const prev =
    activeNavIndex > 0
      ? flatNavItems[activeNavIndex - 1]
      : undefined;
  const next =
    activeNavIndex < flatNavItems.length - 1
      ? flatNavItems[activeNavIndex + 1]
      : undefined;

  const navItems = (
    <>
      {navSections.map(({ header, navItems }) => (
        <Fragment key={header}>
          <Sidebar.Header>{header}</Sidebar.Header>
          {navItems.map((props) => (
            <Sidebar.NavItem key={props.to} {...props} />
          ))}
        </Fragment>
      ))}
    </>
  );

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
            <MenuAlt2Icon
              className="h-6 w-6"
              aria-hidden="true"
            />
          </button>
          <header>
            <h1 className="text-xl text-zinc-300 font-bold px-8 py-4 whitespace-nowrap">
              Remix Validated Form
            </h1>
          </header>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
          <div className="prose prose-invert">
            {children}
            <hr />
            <Footer prev={prev} next={next} />
          </div>
        </main>
      </div>
    </div>
  );
};
