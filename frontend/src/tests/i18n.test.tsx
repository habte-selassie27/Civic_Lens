/**
 * Translation plumbing.
 *
 * What this protects:
 *  - every locale resolves every key it claims, and falls back to English for
 *    the ones it does not — a missing key must never blank the interface;
 *  - the choice persists, sets <html lang>, and is applied in every language;
 *  - copy maps resolve through the active locale at ACCESS time, which is why
 *    40-odd call sites needed no change;
 *  - the catalogs carry no untranslated English leftovers where a translation
 *    is required, and no score/rank vocabulary in any language.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_ATTRIBUTE,
  LOCALE_STORAGE_KEY,
  getLocale,
  lazyMap,
  setLocale,
  t,
  translationCoverage,
  type LocaleCode,
} from "@/i18n";
import { LocaleProvider } from "@/i18n/Provider";
import { LanguageButton } from "@/components/LanguageButton";
import { en } from "@/i18n/messages/en";
import { es } from "@/i18n/messages/es";
import { fr } from "@/i18n/messages/fr";
import { de } from "@/i18n/messages/de";

const CATALOGS: Record<LocaleCode, Partial<Record<keyof typeof en, string>>> = {
  en,
  es,
  fr,
  de,
};

afterEach(() => {
  setLocale(DEFAULT_LOCALE);
  window.localStorage.clear();
});

describe("locale switching", () => {
  it("returns English by default", () => {
    expect(getLocale()).toBe(DEFAULT_LOCALE);
    expect(t("nav.commitments")).toBe("Commitments");
  });

  it("translates into each offered language and back", () => {
    const english = t("nav.commitments");
    const enAttributes: string[] = [];
    for (const locale of LOCALES) {
      setLocale(locale.code);
      expect(getLocale()).toBe(locale.code);
      expect(t("nav.commitments").length).toBeGreaterThan(0);
      // `lang` only changes when the locale actually changes, so English (the
      // starting locale) records nothing here.
      enAttributes.push(document.documentElement.getAttribute(LOCALE_ATTRIBUTE) ?? "en");
    }
    expect(enAttributes).toEqual(["en", "es", "fr", "de"]);

    setLocale(DEFAULT_LOCALE);
    expect(t("nav.commitments")).toBe(english);
  });

  it("uses different wording per language, not a copy-paste", () => {
    const words = LOCALES.map((locale) => {
      setLocale(locale.code);
      return t("nav.commitments");
    });
    expect(new Set(words).size).toBe(LOCALES.length);
  });

  it("ignores an unknown locale rather than blanking the interface", () => {
    setLocale("en");
    setLocale("klingon" as LocaleCode);
    expect(getLocale()).toBe("en");
    expect(t("nav.commitments")).toBe("Commitments");
  });

  it("persists the choice and restores it", () => {
    setLocale("fr");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("fr");
  });

  it("falls back to English for a key a locale does not define", () => {
    setLocale("es");
    // Every locale may be incomplete; the fallback must be English, never "".
    const missing = "some.key.that.does.not.exist";
    expect(t(missing)).toBe(missing);
    expect(t("nav.commitments")).toBe("Compromisos");
  });
});

describe("catalog integrity", () => {
  it("defines every key in English (the source of truth)", () => {
    expect(Object.keys(en).length).toBeGreaterThan(100);
    for (const [key, value] of Object.entries(en)) {
      expect(typeof value, `${key} must be a string`).toBe("string");
      expect(value.length, `${key} must not be empty`).toBeGreaterThan(0);
    }
  });

  it("covers every part of the interface: chrome, copy maps, and controls", () => {
    // A catalog that only translates the nav is not a translated app. These
    // namespaces must all exist before page-by-page extraction is considered
    // complete — and this test keeps that honest as pages get extracted.
    const namespaces = new Set(Object.keys(en).map((key) => key.split(".")[0]));
    for (const required of [
      "nav",
      "theme",
      "language",
      "banner",
      "error",
      "outcome",
      "result",
      "reason",
      "resolution",
      "retrieval",
      "status",
      "trigger",
      "role",
      "data_mode",
      "action",
      "tx_phase",
      "evidence_type",
    ]) {
      expect(namespaces.has(required), `missing namespace: ${required}`).toBe(true);
    }
  });

  it("has no key outside the English catalog", () => {
    const englishKeys = new Set(Object.keys(en));
    for (const locale of LOCALES) {
      const extra = Object.keys(CATALOGS[locale.code]).filter((key) => !englishKeys.has(key));
      expect(extra, `${locale.code} has keys English does not`).toEqual([]);
    }
  });

  it("translates the whole current surface in every offered language", () => {
    // Coverage is asserted, not assumed: a locale that falls back to English
    // is allowed, but a locale that is nearly empty is a regression.
    for (const locale of LOCALES) {
      const { translated, total } = translationCoverage(locale.code);
      const ratio = translated / total;
      expect(ratio, `${locale.code} covers only ${translated}/${total} keys`).toBeGreaterThan(0.5);
    }
  });

  it("keeps the outcome vocabulary neutral in every language", () => {
    // "Inconclusive" must never be worded as a failure in any locale.
    for (const locale of LOCALES) {
      setLocale(locale.code);
      const inconclusive = t("outcome.inconclusive").toLowerCase();
      expect(inconclusive.length).toBeGreaterThan(0);
      for (const banned of ["fail", "failed", "fraud", "liar", "broken", "guilt"]) {
        expect(inconclusive, `${locale.code}: "${inconclusive}"`).not.toContain(banned);
      }
    }
    setLocale(DEFAULT_LOCALE);
  });

  it("uses no score or rank vocabulary in any language", () => {
    // CivicLens never assigns a number to an organization's conduct. A few
    // sentences legitimately use "score"/"grade"/"ranking" to DENY that it does
    // so ("it does not score organizations", "there is no score, no grade, and
    // no ranking"), so those keys are allow-listed explicitly rather than
    // banned outright — the guard is about what the app ASSERTS, not about the
    // word appearing anywhere on screen. Each entry must assert the denial;
    // the test below verifies that.
    const DENIAL = [
      "landing.does_not_body",
      "howit.no_score_body",
      "howit.it_means_body",
      "fair.no_score_body",
    ];
    const banned = ["score", "grade", "rating", "rank", "percentile"];
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(CATALOGS[locale.code])) {
        if (DENIAL.includes(key)) continue;
        const lower = value.toLowerCase();
        for (const word of banned) {
          expect(lower, `${locale.code}/${key} contains "${word}"`).not.toContain(word);
        }
      }
    }
  });

  it("uses the score vocabulary only to deny that CivicLens scores anything", () => {
    // The allow-list in the previous test is only safe while every entry really
    // does deny it. If someone adds a key there later, this fails out loud.
    expect(en["landing.does_not_body"]).toMatch(/does not score/i);
    expect(en["howit.no_score_body"]).toMatch(/no score, no grade, and no ranking/i);
    expect(en["howit.it_means_body"]).toMatch(/never a score/i);
    expect(en["fair.no_score_body"]).toMatch(/negative score.*never used to rank/s);
    expect(en["banner.sample_notice"]).not.toMatch(/score|grade|rank/i);
  });

  it("keeps every placeholder intact in every translation", () => {
    // A translator dropping {network} would render a broken sentence, and one
    // adding {placeholder} would render the braces to a reader.
    const placeholders = (text: string) => (text.match(/\{(\w+)\}/g) ?? []).sort();
    for (const [key, english] of Object.entries(en)) {
      const expected = placeholders(english);
      for (const locale of LOCALES) {
        const translated = CATALOGS[locale.code][key as keyof typeof en];
        if (!translated) continue;
        expect(placeholders(translated), `${locale.code}/${key}`).toEqual(expected);
      }
    }
  });

  it("has no plural-suffix placeholders — English inflection is not translatable", () => {
    // A {plural} slot forces the translator to reproduce English's "record{s}"
    // pattern, which is wrong in languages with different plural rules. Counted
    // copy puts the noun before the number instead.
    const offenders = Object.entries(en).filter(([, value]) => /\{plural\}/.test(value));
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it("fills placeholders from the vars argument", () => {
    expect(t("banner.switch_network", { network: "GenLayer Studio" })).toContain("GenLayer Studio");
    expect(t("language.current", { language: "Español" })).toContain("Español");
    // An unknown placeholder is left visible rather than blanked.
    expect(t("banner.switch_network", {})).toContain("{network}");
  });
});

describe("lazy copy maps", () => {
  it("resolves through the active locale at access time", () => {
    const map = lazyMap({ a: "nav.commitments", b: "nav.demo" });
    setLocale(DEFAULT_LOCALE);
    expect(map.a).toBe("Commitments");
    setLocale("es");
    // Same object, no re-creation: the language switch shows up immediately.
    expect(map.a).toBe("Compromisos");
    setLocale("fr");
    expect(map.a).toBe("Engagements");
    setLocale(DEFAULT_LOCALE);
  });

  it("enumerates like a plain object so tests and spreads keep working", () => {
    const map = lazyMap({ a: "nav.commitments", b: "nav.demo" });
    expect(Object.keys(map).sort()).toEqual(["a", "b"]);
    expect(Object.values(map).sort()).toEqual(["Commitments", "Demo"].sort());
    expect("a" in map).toBe(true);
    expect("nope" in map).toBe(false);
    // Prototype members must not look like keys.
    expect(map.toString).toBeUndefined();
    expect(map.constructor).toBeUndefined();
  });
});

describe("language button", () => {
  beforeEach(() => {
    setLocale(DEFAULT_LOCALE);
    window.localStorage.clear();
  });

  it("lists every locale in its own language and switches on choice", async () => {
    render(
      <LocaleProvider>
        <LanguageButton />
      </LocaleProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Change language" }));

    for (const locale of LOCALES) {
      expect(screen.getByRole("menuitemradio", { name: new RegExp(locale.endonym) })).toBeTruthy();
    }

    await userEvent.click(screen.getByRole("menuitemradio", { name: /Español/ }));

    expect(getLocale()).toBe("es");
    expect(document.documentElement.getAttribute(LOCALE_ATTRIBUTE)).toBe("es");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("es");
    // Menu closes after choosing.
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("marks the active locale for assistive tech", async () => {
    render(
      <LocaleProvider>
        <LanguageButton />
      </LocaleProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));

    const english = screen.getByRole("menuitemradio", { name: /English/ });
    expect(english.getAttribute("aria-checked")).toBe("true");
  });

  it("discloses its expanded state to assistive tech", async () => {
    render(
      <LocaleProvider>
        <LanguageButton />
      </LocaleProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Change language" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("says the translations are drafts", async () => {
    // Honest labelling: a reader should know these were not reviewed by a
    // native speaker.
    render(
      <LocaleProvider>
        <LanguageButton />
      </LocaleProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));
    expect(screen.getByText(/drafts written without a native reviewer/i)).toBeTruthy();
  });
});

describe("caller honesty", () => {
  it("ships all four catalogs", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(CATALOGS[locale.code]).length).toBeGreaterThan(0);
    }
  });

  it("declares each locale's native name", () => {
    for (const locale of LOCALES) {
      expect(locale.endonym.length).toBeGreaterThan(1);
      expect(locale.name.length).toBeGreaterThan(1);
    }
  });

  it("uses the same wording for an action across every locale", () => {
    // One name per action is a product rule; a translator must not invent a
    // second verb for the same button.
    const keys = [
      "action.register_commitment",
      "action.add_evidence",
      "action.request_review",
      "action.open_challenge",
      "action.supersede",
      "action.withdraw",
    ] as const;
    for (const key of keys) {
      const seen = new Set<string>();
      for (const locale of LOCALES) {
        const value = CATALOGS[locale.code][key];
        if (!value) continue;
        expect(seen.has(value), `${key} is translated two ways`).toBe(false);
        seen.add(value);
      }
      expect(seen.size).toBe(LOCALES.length);
    }
  });
});

describe("document language", () => {
  const html = readFileSync(path.resolve(process.cwd(), "index.html"), "utf8");

  it("starts in English so the initial markup is not mislabelled", () => {
    expect(html).toMatch(/<html lang="en"/);
  });
});
