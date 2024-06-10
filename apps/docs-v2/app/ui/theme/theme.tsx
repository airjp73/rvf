import { MoonIcon, MoonStarIcon, SunDim } from "lucide-react";
import { ComponentProps } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { ClientOnly } from "remix-utils/client-only";
import invariant from "tiny-invariant";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  useThemeActorref as useThemeActorRef,
  useThemeSelector,
} from "./themeMachine";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { cn } from "~/lib/utils";

const storageSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export type Theme = z.infer<typeof storageSchema>["theme"];

export const getInitialThemeInfo = (): {
  displayed: Theme;
  state: Theme | "system";
} => {
  invariant(
    localStorage,
    "Can only access the theme on the client. Consider wrapping the component in a `ClientOnly`."
  );

  try {
    const { theme } = storageSchema.parse(localStorage);
    return { displayed: theme, state: theme };
  } catch (err) {
    return {
      displayed: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
      state: "system",
    };
  }
};

const Moon = motion(MoonIcon);
const Sun = motion(SunDim);

const AutoIcon = ({
  className,
  setting,
  displayedTheme,
}: {
  className?: string;
  setting: "light" | "dark" | "auto";
  displayedTheme: "light" | "dark";
}) => {
  const animate = setting === "auto" ? `auto-${displayedTheme}` : setting;
  console.log(animate);
  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center rotate-45"
        variants={{
          light: {
            clipPath: `polygon(100% 0, 100% 0, 100% 100%, 100% 100%)`,
          },
          dark: {
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
          },
          "auto-dark": {
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
          },
          "auto-light": {
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
          },
        }}
        animate={animate}
      >
        <Moon
          className={cn("text-cyan-500 size-6")}
          variants={{
            light: {
              rotate: "-135deg",
              scale: 1,
              x: 0,
              y: 0,
            },
            dark: {
              rotate: "-135deg",
              scale: 1,
              x: 0,
              y: 0,
            },
            "auto-dark": {
              rotate: "-135deg",
              scale: 0.95,
              x: "15%",
              y: 0,
            },
            "auto-light": {
              rotate: "-135deg",
              scale: 0.65,
              x: "35%",
              y: 0,
            },
          }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center rotate-45"
        variants={{
          dark: {
            clipPath: `polygon(0 0, 0 0, 0 100%, 0% 100%)`,
          },
          light: {
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
          },
          "auto-dark": {
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
          },
          "auto-light": {
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
          },
        }}
        animate={animate}
      >
        <Sun
          className={cn("text-amber-500 size-8")}
          variants={{
            light: {
              rotate: "-45deg",
              scale: 1,
              x: 0,
              y: 0,
            },
            dark: {
              rotate: "-45deg",
              scale: 1,
              x: 0,
              y: 0,
            },
            "auto-dark": {
              rotate: "-45deg",
              scale: 0.65,
              x: "-35%",
              y: 0,
            },
            "auto-light": {
              rotate: "-45deg",
              scale: 0.95,
              x: "-15%",
              y: 0,
            },
          }}
        />
      </motion.div>
    </div>
  );
};

export type ThemeToggleProps = {
  className?: string;
  buttonVariant?: ComponentProps<typeof Button>["variant"];
};

export const ThemeToggle = ({ className, buttonVariant }: ThemeToggleProps) => {
  const setting = useThemeSelector((state) =>
    state.matches("dark") ? "dark" : state.matches("light") ? "light" : "auto"
  );
  const displayedTheme = useThemeSelector(
    (state) => state.context.displayedTheme
  );
  const themeActor = useThemeActorRef();

  const buttonText = () => {
    if (setting === "dark") return "Dark theme selected";
    if (setting === "light") return "Light theme selected";
    return "System theme selected";
  };

  const hydrated = useHydrated();

  return (
    <DropdownMenu>
      <ClientOnly>
        {() => (
          <DropdownMenuTrigger asChild>
            <Button
              variant={buttonVariant}
              size="icon"
              className={cn(className)}
            >
              <span className="sr-only">{buttonText()}</span>
              <AutoIcon
                aria-hidden
                setting={setting}
                displayedTheme={displayedTheme}
                className="h-full w-full"
              />
            </Button>
          </DropdownMenuTrigger>
        )}
      </ClientOnly>
      <DropdownMenuContent sideOffset={15}>
        <DropdownMenuItem
          onClick={() => themeActor.send({ type: "choose light" })}
        >
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => themeActor.send({ type: "choose dark" })}
        >
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => themeActor.send({ type: "choose auto" })}
        >
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ThemedHtmlElement = (
  props: React.ButtonHTMLAttributes<HTMLHtmlElement>
) => {
  const displayedTheme = useThemeSelector(
    (state) => state.context.displayedTheme
  );

  return (
    <html
      {...props}
      data-theme={displayedTheme}
      suppressHydrationWarning
      className={cn("dark:dark", props.className)}
    />
  );
};

export const ThemeScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        // Ensure dark mode is always correctly set without a flash of light mode 
        if (localStorage.theme) {
          document.documentElement.dataset.theme = localStorage.theme;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.dataset.theme = 'dark';
        } else {
          document.documentElement.dataset.theme = 'light';
        }
      `,
    }}
  />
);
