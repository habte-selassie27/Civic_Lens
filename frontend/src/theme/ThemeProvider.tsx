/**
 * Theme provider — the single source of the current preference.
 *
 * The document attribute is written by the inline boot script in index.html
 * BEFORE first paint (see domain/theme.ts) so a dark-theme visitor never sees
 * a white flash. This provider mirrors that same state into React, follows OS
 * changes while the preference is `system`, and persists explicit choices.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyPreference,
  readStoredPreference,
  resolveTheme,
  writeStoredPreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/domain/theme";

interface ThemeContextValue {
  preference: ThemePreference;
  /** What the page actually shows right now. */
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
}

/**
 * Default value rather than a thrown error. The theme control is chrome, and
 * chrome must render in any embedding — a single page rendered on its own (a
 * test, a preview harness, an embed) has no provider above it. With this
 * default it shows "system", which is exactly what an unwrapped document would
 * apply anyway via `prefers-color-scheme`, so nothing is silently wrong.
 */
const ThemeContext = createContext<ThemeContextValue>({
  preference: "system",
  resolved: "light",
  setPreference: () => {},
});

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window === "undefined" ? "system" : readStoredPreference(window.localStorage),
  );
  const [prefersDark, setPrefersDark] = useState<boolean>(systemPrefersDark);

  // Follow the OS while the preference is "system" — no reload, no stale theme.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // The document attribute is the CSS switch; keep it in step with React.
  useEffect(() => {
    applyPreference(typeof document === "undefined" ? null : document, preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    writeStoredPreference(typeof window === "undefined" ? null : window.localStorage, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved: resolveTheme(preference, prefersDark), setPreference }),
    [preference, prefersDark, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
