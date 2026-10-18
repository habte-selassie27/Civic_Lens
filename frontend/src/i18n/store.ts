/**
 * i18n store — the locale registry and the `t()` lookup.
 *
 * Design note (why not React context for `t()` itself): half the app's copy
 * lives in plain domain helpers — `STATUS_LABEL[row.status]`, `reasonCopy(x)` —
 * that are called from ordinary functions and from tests, not from components.
 * Those call sites must keep working, so the active locale lives in a module
 * store rather than in context. The provider subscribes to it purely to
 * re-render; nothing reads React state to translate a string.
 *
 * Resolution order for a key: active locale -> English -> the key itself.
 * Falling back is deliberate: a partially translated page renders real English
 * rather than a raw identifier, and the translation tests count coverage
 * instead of pretending it is complete.
 */

export const LOCALES = [
  { code: "en", name: "English", endonym: "English", dir: "ltr" },
  { code: "es", name: "Spanish", endonym: "Español", dir: "ltr" },
  { code: "fr", name: "French", endonym: "Français", dir: "ltr" },
  { code: "de", name: "German", endonym: "Deutsch", dir: "ltr" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "civiclens.locale";
export const LOCALE_ATTRIBUTE = "lang";

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === "string" && LOCALES.some((locale) => locale.code === value);
}

/** Locales offered in the language control, English first, then the drafts. */
export function otherLocales(): Array<(typeof LOCALES)[number]> {
  return LOCALES.filter((locale) => locale.code !== DEFAULT_LOCALE);
}

type Catalog = Record<string, string>;

// Populated by the messages/*.ts modules (registerCatalog).
const catalogs = new Map<LocaleCode, Catalog>();

export function registerCatalog(locale: LocaleCode, catalog: Catalog): void {
  catalogs.set(locale, catalog);
}

let active: LocaleCode = DEFAULT_LOCALE;
const listeners = new Set<(locale: LocaleCode) => void>();

export function getLocale(): LocaleCode {
  return active;
}

/** Subscribe to locale changes. Returns an unsubscribe function. */
export function subscribeLocale(listener: (locale: LocaleCode) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Set the active locale. Unknown codes are ignored rather than half-applied:
 * a missing translation must never blank the interface.
 */
export function setLocale(next: unknown): LocaleCode {
  if (!isLocaleCode(next) || next === active) return active;
  active = next;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(LOCALE_ATTRIBUTE, next);
  }
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Storage may be unavailable; the choice still applies for this session.
  }
  for (const listener of listeners) listener(next);
  return active;
}

export function readStoredLocale(): LocaleCode {
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocaleCode(raw) ? raw : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** Apply the stored locale on boot (the provider does this once, on mount). */
export function initLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return setLocale(readStoredLocale());
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

/**
 * Translate a key. `vars` fills `{placeholder}` slots.
 *
 * Keys are dot-paths into the catalog ("status.evidence_open"), which keeps
 * them greppable and groups related copy under one namespace.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const chosen = catalogs.get(active)?.[key];
  if (chosen !== undefined) return interpolate(chosen, vars);
  const fallback = catalogs.get(DEFAULT_LOCALE)?.[key];
  if (fallback !== undefined) return interpolate(fallback, vars);
  // No catalog entry at all: returning the key keeps the UI readable and
  // makes the gap obvious instead of rendering an empty string.
  return key;
}

/** How many keys a locale defines, and how many it shares with English. */
export function translationCoverage(locale: LocaleCode): { translated: number; total: number } {
  const total = Object.keys(catalogs.get(DEFAULT_LOCALE) ?? {}).length;
  const translated = Object.keys(catalogs.get(locale) ?? {}).length;
  return { translated, total };
}
