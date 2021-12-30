import { MenuAlt2Icon } from "@heroicons/react/outline";
import { FC, useState } from "react";
import { Sidebar } from "../components/Sidebar";

export const Layout: FC = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = (
    <>
      <Sidebar.NavItem label="Home" to="/" end />
      <Sidebar.NavItem label="Installation" to="/installation" />
      <Sidebar.NavItem
        label="Integrate your components"
        to="/integrate-your-components"
      />
      <Sidebar.NavItem
        label="Server Validation"
        to="/server-validation"
      />
      <Sidebar.NavItem label="Default Values" to="/default-values" />
      <Sidebar.NavItem
        label="Validation libarary support"
        to="/validation-library-support"
      />
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
            <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <header>
            <h1 className="text-xl text-zinc-300 font-bold px-8 py-4 whitespace-nowrap">
              Remix Validated Form
            </h1>
          </header>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
          <div className="prose prose-invert">{children}</div>
        </main>
      </div>
    </div>
  );
};
