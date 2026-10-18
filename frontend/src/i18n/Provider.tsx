/**
 * Locale provider + `useLocale()`.
 *
 * Holds the active locale in React state so the tree re-renders on a switch,
 * while the actual translation happens in the module store (see store.ts for
 * why). Also keeps `<html lang>` correct, which is what screen readers and
 * browser translation use.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  getLocale,
  initLocale,
  setLocale,
  subscribeLocale,
  t as translate,
  type LocaleCode,
} from "./store";

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (next: LocaleCode) => void;
}

/**
 * Default value rather than a thrown error. `t()` reads the module store, not
 * context, so a component rendered without the provider still translates
 * correctly — it simply cannot switch locale from that subtree. Failing hard
 * here would break every isolated component render for no real fault.
 */
const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: (next) => {
    setLocale(next);
  },
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getLocale);

  useEffect(() => {
    // Pick up the stored preference once on mount (nothing to do in tests
    // where localStorage is empty — English stays active).
    initLocale();
    setLocaleState(getLocale());
    return subscribeLocale((next) => setLocaleState(next));
  }, []);

  const change = useCallback((next: LocaleCode) => {
    setLocale(next);
    setLocaleState(getLocale());
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale: change }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/**
 * The translator hook components must use: `const t = useT()`.
 *
 * `t` imported directly from the store reads the right STRING at any moment,
 * but a component that does not subscribe to the locale will not RE-RENDER when
 * it changes — the locale lives in a module store, outside React's knowledge.
 * Calling this hook subscribes the component, so a language switch repaints the
 * text in place.
 *
 * The two must not be confused:
 *   - plain functions, tests, and copy maps  -> import { t } (value only)
 *   - components that render text            -> useT() (value + re-render)
 */
export function useT(): (key: string, vars?: Record<string, string | number>) => string {
  useLocale();
  return translate;
}
