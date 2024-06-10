import { MoonIcon, SunDim } from "lucide-react";
import { ComponentProps } from "react";
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
  displayedTheme: "light" | "dark" | undefined;
}) => {
  const animate =
    setting === "auto" && !!displayedTheme ? `auto-${displayedTheme}` : setting;
  return (
    <motion.div
      className={cn("relative", className)}
      animate={animate}
      initial={animate}
      transition={{
        type: "tween",
      }}
    >
      <motion.div className="absolute inset-0 flex items-center justify-center rotate-45">
        <Moon
          className={cn("text-cyan-800 dark:text-cyan-400 size-6")}
          variants={{
            light: {
              rotate: "-135deg",
              opacity: 0,
              scale: 0.25,
              x: "60%",
              y: 0,
            },
            dark: {
              rotate: "-135deg",
              scale: 1,
              opacity: 1,
              x: 0,
              y: 0,
            },
            "auto-dark": {
              rotate: "-135deg",
              opacity: 1,
              scale: 0.95,
              x: "15%",
              y: 0,
            },
            "auto-light": {
              rotate: "-135deg",
              opacity: 1,
              scale: 0.65,
              x: "35%",
              y: 0,
            },
          }}
        />
      </motion.div>
      <motion.div className="absolute inset-0 flex items-center justify-center rotate-45">
        <Sun
          className={cn("text-amber-700 dark:text-amber-400 size-8")}
          variants={{
            light: {
              rotate: "-45deg",
              scale: 1,
              opacity: 1,
              x: 0,
              y: 0,
            },
            dark: {
              rotate: "-45deg",
              scale: 0.25,
              opacity: 0,
              x: "-60%",
              y: 0,
            },
            "auto-dark": {
              rotate: "-45deg",
              scale: 0.65,
              opacity: 1,
              x: "-35%",
              y: 0,
            },
            "auto-light": {
              rotate: "-45deg",
              scale: 0.95,
              opacity: 1,
              x: "-15%",
              y: 0,
            },
          }}
        />
      </motion.div>
    </motion.div>
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
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => themeActor.send({ type: "choose dark" })}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => themeActor.send({ type: "choose auto" })}
        >
          System
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
      className={cn(displayedTheme === "dark" && "dark", props.className)}
    />
  );
};

export const ThemeScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        // Ensure dark mode is always correctly set without a flash of light mode 
        if (localStorage.theme) {
          if (localStorage.theme === "dark") {
            document.documentElement.classList.add("dark");
          }
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add("dark");
        }
      `,
    }}
  />
);
