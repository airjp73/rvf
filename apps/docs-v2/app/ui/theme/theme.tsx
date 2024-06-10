import { Snowflake, Sun } from "lucide-react";
import { ComponentProps } from "react";
import { useHydrated } from "remix-utils";
import invariant from "tiny-invariant";
import { z } from "zod";
import { useThemeSelector } from "./themeMachine";
import { Button } from "./ui/Button";
import { cn } from "../cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

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
  iconSize,
}: {
  className?: string;
  percentLight: number;
  iconSize: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      <Snowflake
        className={cn("absolute inset-0 text-cyan-500", iconSize)}
        style={{
          clipPath: `polygon(${percentLight}% 0, 100% 0, 100% 100%, ${percentLight}% 100%)`,
          transition: "clip-path 1s ease-out",
        }}
      />
      <Sun
        className={cn("absolute inset-0 text-amber-500", iconSize)}
        style={{
          clipPath: `polygon(0 0, ${percentLight}% 0, ${percentLight}% 100%, 0% 100%)`,
          transition: "clip-path 1s ease-out",
        }}
      />
    </div>
  );
};

export type ThemeToggleProps = {
  className?: string;
  buttonVariant?: ComponentProps<typeof Button>["variant"];
};

export const ThemeToggle = ({ className, buttonVariant }: ThemeToggleProps) => {
  const { t } = useTranslation();
  const [state, send] = useTheme();

  const buttonText = () => {
    if (state.matches("dark")) return t("theme.selected.dark");
    if (state.matches("light")) return t("theme.selected.light");
    return t("theme.selected.auto");
  };

  const hydrated = useHydrated();

  const getPercentage = () => {
    if (!hydrated) return 50;
    if (state.matches("system")) return 50;
    if (state.matches("light")) return 100;
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
            iconSize="h-6 w-6"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={15}>
        <DropdownMenuItem onClick={() => send({ type: "choose light" })}>
          <Sun aria-hidden className="mr-2 h-5 w-5 text-amber-500" />
          <span>{t("theme.light")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => send({ type: "choose dark" })}>
          <Snowflake aria-hidden className="mr-2 h-5 w-5 text-cyan-500" />
          <span>{t("theme.dark")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => send({ type: "choose auto" })}>
          <AutoIcon
            aria-hidden
            className="mr-2 h-5 w-5"
            iconSize="h-5 w-5"
            percentLight={50}
          />
          <span>{t("theme.auto")}</span>
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

  return <html {...props} data-theme={displayedTheme} />;
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
