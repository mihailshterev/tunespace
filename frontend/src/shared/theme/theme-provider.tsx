import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, THEME_STORAGE_KEY, type ResolvedTheme, type Theme } from "./theme-context";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const readStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  } catch {
    return "system";
  }
};

const systemTheme = (): ResolvedTheme => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

// Swapping the theme class would otherwise animate every element with a colour transition at once.
const withoutTransitions = (apply: () => void) => {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  apply();
  // Force a reflow so the class change is painted before transitions come back.
  void window.getComputedStyle(document.body).opacity;
  setTimeout(() => style.remove(), 1);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystem(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = theme === "system" ? system : theme;

  useEffect(() => {
    withoutTransitions(() => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    });
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice still applies for this session.
    }
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
