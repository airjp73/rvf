import { create } from "zustand";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetBody, SheetContent, SheetTrigger } from "../sheet";
import { Navigation, TopLevelNavItem } from "./Navigation";
import { Button } from "../button";
import { GithubIcon } from "../icons/GithubIcon";
import { Link, useLocation } from "react-router";
import { Logo } from "../branding/Logo";
import { useEffect } from "react";

export const useMobileNavigationStore = create<{
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  routeChange: (route: string) => void;
  route?: string;
}>()((set, get) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open: boolean) => set({ isOpen: open }),
  routeChange: (route: string) => {
    if (route === get().route) return;
    set({ route, isOpen: false });
  },
}));

export function MobileNavigation() {
  let store = useMobileNavigationStore();
  const location = useLocation();

  useEffect(() => {
    store.routeChange(location.pathname);
  }, [location.pathname, store]);

  return (
    <Sheet open={store.isOpen} onOpenChange={store.setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Toggle navigation"
          onClick={store.toggle}
        >
          <MenuIcon className="size-4 stroke-zinc-900 dark:stroke-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetBody>
          <Navigation
            topLevelItems={
              <>
                <li className="mb-4">
                  <Link to="/" aria-label="Home">
                    <Logo className="h-8" />
                  </Link>
                </li>
                <TopLevelNavItem
                  href="https://www.github.com/airjp73/remix-validated-form"
                  className="mb-8"
                >
                  <GithubIcon className="size-4 fill-current" /> Github
                </TopLevelNavItem>
              </>
            }
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
