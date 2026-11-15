"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        aria-label="Toggle theme"
        disabled
      >
        <span className="size-4 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className="size-4 transition-transform text-foreground" />
      ) : (
        <Moon className="size-4 transition-transform text-foreground" />
      )}
    </Button>
  );
}
