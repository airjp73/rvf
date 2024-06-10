import { MoonStarIcon, SunDim } from "lucide-react";
import { ComponentProps } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import invariant from "tiny-invariant";
import { z } from "zod";
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

const AutoIcon = ({
  className,
  percentLight,
}: {
  className?: string;
  percentLight: number;
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MoonStarIcon
          className={cn("text-cyan-500 -scale-x-100 size-6")}
          style={{
            clipPath: `polygon(0 0, ${100 - percentLight}% 0, ${
              100 - percentLight
            }% 100%, 0 100%)`,
            transition: "clip-path .5s ease-out",
          }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <SunDim
          className={cn("text-amber-500 size-8")}
          style={{
            clipPath: `polygon(0 0, ${percentLight}% 0, ${percentLight}% 100%, 0% 100%)`,
            transition: "clip-path .5s ease-out",
          }}
        />
      </div>
    </div>
  );
};

export type ThemeToggleProps = {
  className?: string;
  buttonVariant?: ComponentProps<typeof Button>["variant"];
};

export const ThemeToggle = ({ className, buttonVariant }: ThemeToggleProps) => {
  const themeBehavior = useThemeSelector((state) =>
    state.matches("dark") ? "dark" : state.matches("light") ? "light" : "auto"
  );
  const themeActor = useThemeActorRef();

  const buttonText = () => {
    if (themeBehavior === "dark") return "Dark theme selected";
    if (themeBehavior === "light") return "Light theme selected";
    return "System theme selected";
  };

  const hydrated = useHydrated();

  const getPercentage = () => {
    if (!hydrated) return 50;
    if (themeBehavior === "auto") return 50;
    if (themeBehavior === "light") return 100;
    return 0;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size="icon" className={cn(className)}>
          <span className="sr-only">{buttonText()}</span>
          <AutoIcon
            aria-hidden
            percentLight={getPercentage()}
            className="h-full w-full"
          />
        </Button>
      </DropdownMenuTrigger>
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
