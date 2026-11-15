"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

export interface UseThemeProps {
  themes: string[];
  theme?: string;
  setTheme: (theme: string) => void;
  resolvedTheme?: "light" | "dark";
  systemTheme?: "light" | "dark";
  forcedTheme?: string;
}

const ThemeContext = React.createContext<UseThemeProps>({
  themes: ["light", "dark", "system"],
  theme: "system",
  setTheme: () => {},
  resolvedTheme: undefined,
  systemTheme: undefined,
});

export function useTheme(): UseThemeProps {
  return React.useContext(ThemeContext);
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  forcedTheme?: string;
  themes?: string[];
  enableColorScheme?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  forcedTheme,
  themes = ["light", "dark", "system"],
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      return localStorage.getItem(storageKey) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark" | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Listen to system media query changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Listen to storage changes from other tabs
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setThemeState(e.newValue || defaultTheme);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey, defaultTheme]);

  const resolvedTheme: "light" | "dark" | undefined = React.useMemo(() => {
    if (forcedTheme) return forcedTheme === "dark" ? "dark" : "light";
    if (theme === "system" && enableSystem) {
      return systemTheme;
    }
    return theme === "dark" ? "dark" : "light";
  }, [forcedTheme, theme, enableSystem, systemTheme]);

  // Apply theme to DOM
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const targetTheme = resolvedTheme || "light";

    let cleanTransition: (() => void) | undefined;

    if (disableTransitionOnChange) {
      const css = document.createElement("style");
      css.appendChild(
        document.createTextNode(
          "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
        )
      );
      document.head.appendChild(css);
      cleanTransition = () => {
        window.getComputedStyle(document.body);
        setTimeout(() => {
          if (document.head.contains(css)) {
            document.head.removeChild(css);
          }
        }, 1);
      };
    }

    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(targetTheme);
    } else {
      root.setAttribute(attribute, targetTheme);
    }
    root.style.colorScheme = targetTheme;

    cleanTransition?.();
  }, [resolvedTheme, attribute, disableTransitionOnChange]);

  const setTheme = React.useCallback(
    (newTheme: string) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Safe fallback in restrictive environments
      }
    },
    [storageKey]
  );

  const value = React.useMemo<UseThemeProps>(
    () => ({
      themes,
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      forcedTheme,
    }),
    [themes, theme, setTheme, resolvedTheme, systemTheme, forcedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
