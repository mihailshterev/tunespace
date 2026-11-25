import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

// Same key and plain-string format next-themes used, so a theme chosen before the migration still applies.
// public/theme-init.js reads it too, to apply the theme before first paint.
export const THEME_STORAGE_KEY = "theme";

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
