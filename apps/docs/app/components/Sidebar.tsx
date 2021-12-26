import { Dialog } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import {
  cloneElement,
  ComponentProps,
  FC,
  ReactElement,
  useEffect,
} from "react";
import { useTransition, NavLink } from "remix";

export type SidebarProps = {
  className?: string;
  bottomContent?: ReactElement;
};

export type SidebarNavItemProps = {
  label: string;
  to: string;
  icon: ReactElement;
  count?: number;
  end?: boolean;
  className?: string;
};

export type SlideOutProps = {
  onClose: () => void;
  open: boolean;
};

export type SidebarType = FC<
  SidebarProps & ComponentProps<typeof motion.div>
> & {
  NavItem: FC<SidebarNavItemProps>;
  SlideOut: FC<SlideOutProps>;
};

export const Sidebar: SidebarType = ({
  children,
  bottomContent,
  className,
  ...rest
}) => {
  return (
    <motion.div
      className={classNames(
        "flex-1 flex flex-col min-h-0 bg-zinc-900",
        className
      )}
      {...rest}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 text-zinc-300 font-bold text-xl">
          Remix Validated Form
        </div>
        <nav
          className="mt-5 flex-1 px-2 bg-zinc-900 space-y-1"
          aria-label="Sidebar"
        >
          {children}
        </nav>
      </div>
      {bottomContent}
    </motion.div>
  );
};

const NavItem: SidebarType["NavItem"] = ({
  label,
  to,
  icon,
  count,
  end,
  className,
}) => (
  <NavLink
    to={to}
    end={end}
    className={classNames(
      "navItem", // need to drop down to css to get children to be styled correctly when active
      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
      className
    )}
  >
    {cloneElement(icon, {
      className: "navItemIcon mr-3 flex-shrink-0 h-6 w-6",
      "aria-hidden": "true",
    })}
    <span className="flex-1">{label}</span>
    {!!count && (
      <span
        className={
          "navItemCount ml-3 inline-block py-0.5 px-3 text-xs font-medium rounded-full"
        }
      >
        {count}
      </span>
    )}
  </NavLink>
);
Sidebar.NavItem = NavItem;

const SlideOut: SidebarType["SlideOut"] = ({ children, open, onClose }) => {
  const transition = useTransition();

  useEffect(() => {
    if (transition.state === "loading") onClose();
  }, [onClose, transition.state]);

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          static
          as={motion.div}
          className="fixed inset-0 flex z-40 md:hidden"
          onClose={onClose}
          open
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <Dialog.Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "linear", duration: 0.3 }}
            className="fixed inset-0 bg-zinc-800 bg-opacity-75"
          />
          <Sidebar
            className="relative"
            initial={{ translateX: "-100%" }}
            animate={{ translateX: "0%" }}
            exit={{ translateX: "-100%" }}
            transition={{ type: "linear", duration: 0.3 }}
          >
            <motion.div
              className="absolute top-0 right-0 -mr-12 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "linear", duration: 0.3 }}
            >
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </motion.div>
            {children}
          </Sidebar>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
Sidebar.SlideOut = SlideOut;
