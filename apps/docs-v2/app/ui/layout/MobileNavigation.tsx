import { create } from "zustand";
import { MenuIcon, XIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Navigation, TopLevelNavItem } from "./Navigation";
import { Button } from "../button";
import { GithubIcon } from "../icons/GithubIcon";
import { Link } from "@remix-run/react";
import { Logo } from "../branding/Logo";

export const useMobileNavigationStore = create<{
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open: boolean) => set({ isOpen: open }),
}));

export function MobileNavigation() {
  let store = useMobileNavigationStore();

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
        ></Navigation>
      </SheetContent>
    </Sheet>
  );
}
