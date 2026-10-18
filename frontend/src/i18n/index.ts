/**
 * i18n barrel — registers every catalog and re-exports the API.
 *
 * Registration happens on import, before any `t()` call, because every
 * consumer imports from "@/i18n" rather than from store.ts directly. That is
 * what makes a missing registration impossible to reach by accident.
 */

import { en } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { de } from "./messages/de";
import { registerCatalog } from "./store";

registerCatalog("en", en);
registerCatalog("es", es);
registerCatalog("fr", fr);
registerCatalog("de", de);

export { LocaleProvider, useLocale, useT } from "./Provider";
export {
  DEFAULT_LOCALE,
  LOCALES,
  getLocale,
  isLocaleCode,
  otherLocales,
  setLocale,
  subscribeLocale,
  t,
  translationCoverage,
  LOCALE_STORAGE_KEY,
  LOCALE_ATTRIBUTE,
  type LocaleCode,
} from "./store";
export { lazyMap } from "./lazy";
export type { MessageKey } from "./messages/en";
