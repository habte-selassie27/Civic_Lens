/**
 * Theme preference logic — pure, so it can be tested without a DOM.
 *
 * Three preferences: `system` (follow the OS), `light`, `dark`. The resolved
 * theme is what the page actually shows: `system` collapses to light or dark
 * depending on `prefers-color-scheme`, which is also how the CSS resolves
 * `light-dark()` tokens — this module mirrors that, not replaces it.
 *
 * The stored value is the PREFERENCE, never the resolved theme, so switching
 * the OS setting while "system" is chosen keeps following it.
 */

export const THEMES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEMES)[number];
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "civiclens.theme";
export const THEME_ATTRIBUTE = "data-theme";

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/** Read the stored preference; anything unrecognised (or absent) means system. */
export function readStoredPreference(storage: Pick<Storage, "getItem"> | null): ThemePreference {
  try {
    const raw = storage?.getItem(THEME_STORAGE_KEY) ?? null;
    return isThemePreference(raw) ? raw : "system";
  } catch {
    // Storage can throw (private mode, blocked cookies). System is a safe read.
    return "system";
  }
}

export function writeStoredPreference(
  storage: Pick<Storage, "setItem"> | null,
  preference: ThemePreference,
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // A preference that cannot be persisted still applies for this session.
  }
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

/**
 * The attribute the document carries. It is the preference (not the resolved
 * theme) because the stylesheet pins a scheme only for explicit choices; the
 * value is also what makes the current setting inspectable in devtools.
 */
export function themeAttribute(preference: ThemePreference): string {
  return preference;
}

const STORAGE_KEY = THEME_STORAGE_KEY;

/**
 * Applies a preference to the document element. Separate from the React
 * provider because index.html runs it inline before first paint — a theme that
 * flashes light before hydrating is worse than no theme switch at all.
 */
export function applyPreference(
  doc: Pick<Document, "documentElement"> | null,
  preference: ThemePreference,
): void {
  if (!doc) return;
  const el = doc.documentElement;
  el.setAttribute(THEME_ATTRIBUTE, themeAttribute(preference));
}

/** Options the inline boot script passes to applyPreference. */
export const THEME_BOOT_SCRIPT = `(function(){try{var v=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});if(v!=="light"&&v!=="dark")v="system";document.documentElement.setAttribute(${JSON.stringify(
  THEME_ATTRIBUTE,
)},v);}catch(e){document.documentElement.setAttribute(${JSON.stringify(
  THEME_ATTRIBUTE,
)},"system");}})();`;
