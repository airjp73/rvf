import { assign, fromCallback, setup } from "xstate";
import { createActorContext } from "@xstate/react";
import { z } from "zod";

const storageSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export type Theme = z.infer<typeof storageSchema>["theme"];

const themeMachine = setup({
  types: {
    events: {} as
      | { type: "choose dark" | "choose light" | "choose auto" }
      | { type: "system theme changed"; value: "dark" | "light" },
    context: {
      displayedTheme: undefined as "light" | "dark" | undefined,
    },
  },

  guards: {
    "is server": () => typeof window === "undefined",
    "is overridden to dark mode": () => localStorage.theme === "dark",
    "is overridden to light mode": () => localStorage.theme === "light",
  },
  actions: {
    "override to dark mode": () => {
      localStorage.theme = "dark";
    },
    "override to light mode": () => {
      localStorage.theme = "light";
    },
    "clear local storage": () => {
      delete localStorage.theme;
    },
    "show dark theme": assign({ displayedTheme: () => "dark" as const }),
    "show light theme": assign({ displayedTheme: () => "light" as const }),
    "show system theme": assign({
      displayedTheme: ({ event, context }) => {
        if (event.type === "system theme changed") return event.value;
        return context.displayedTheme;
      },
    }),
    "set display theme from system": assign({
      displayedTheme: (ctx) =>
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    }),
  },
  actors: {
    "listen for system changes": fromCallback(({ sendBack }) => {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        sendBack({
          type: "system theme changed",
          value: e.matches ? "dark" : "light",
        });
      };
      query.addEventListener("change", handler);
      return () => query.removeEventListener("change", handler);
    }),
  },
}).createMachine({
  id: "theme",
  context: {
    displayedTheme: undefined,
  },
  states: {
    system: {
      invoke: {
        src: "listen for system changes",
      },

      entry: ["clear local storage", "set display theme from system"],

      on: {
        "choose dark": "dark",
        "choose light": "light",

        "system theme changed": {
          target: "system",
          actions: ["show system theme"],
        },
      },
    },

    dark: {
      on: {
        "choose light": "light",
        "choose auto": "system",
      },

      entry: ["override to dark mode", "show dark theme"],
    },

    light: {
      on: {
        "choose dark": "dark",
        "choose auto": "system",
      },

      entry: ["override to light mode", "show light theme"],
    },

    init: {
      always: [
        {
          target: "ssr",
          guard: "is server",
        },
        {
          target: "dark",
          guard: "is overridden to dark mode",
        },
        {
          target: "light",
          guard: "is overridden to light mode",
        },
        "system",
      ],
    },

    ssr: {
      description: `We don't do anything here. Pre-hydration theme is done by a script tag.`,
    },
  },

  initial: "init",
});

export const {
  Provider: ThemeProvider,
  useSelector: useThemeSelector,
  useActorRef: useThemeActorref,
} = createActorContext(themeMachine);
