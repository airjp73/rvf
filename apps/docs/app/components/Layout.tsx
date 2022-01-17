import { MenuAlt2Icon } from "@heroicons/react/outline";
import React, {
  FC,
  Fragment,
  useEffect,
  useState,
} from "react";
import { useLocation, useMatches } from "remix";
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
        label: "Repeated field names",
        to: "/repeated-field-names",
      },
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
  const location = useLocation();
  const focusedProp = location.hash.replace("#", "");
  useEffect(() => {
    const el = document.getElementById(focusedProp);
    if (el) el.scrollIntoView();
  }, [focusedProp]);

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
    <>
      <Sidebar.SlideOut
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        {navItems}
      </Sidebar.SlideOut>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0 h-screen sticky top-0">
        <div className="flex flex-col w-64 top-0">
          <Sidebar>{navItems}</Sidebar>
        </div>
      </div>

      <div className="z-10 flex-shrink-0 flex h-16 bg-zinc-700 md:hidden items-center sticky top-0">
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

      <div className="flex flex-col flex-1">
        <main className="relative focus:outline-none p-8 prose prose-invert flex-1 md:flex-initial">
          {children}
        </main>

        <Footer
          className="prose prose-invert border-t border-zinc-700 py-8 px-4"
          prev={prev}
          next={next}
        />
      </div>
    </>
  );
};
