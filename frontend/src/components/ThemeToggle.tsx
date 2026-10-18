/**
 * Appearance control — light / dark / system, as one compact button.
 *
 * Replaces the native `<select>` for two reasons: the header is a single line
 * and a wide form control in it crowds the account controls; and the three
 * preferences are a short, fixed set, which a button can carry just as
 * honestly.
 *
 * What was traded away, deliberately: a `<select>` states its own value and
 * offers every option at once. A cycling button does neither, so this one
 * keeps the VALUE VISIBLE as text next to the icon (`◐ System`) and puts the
 * same words in the accessible name. The state is therefore never guessed
 * from an icon alone — which was the reason the select existed in the first
 * place. Icon-only is not used, because an icon cannot say "System".
 */

import { useTheme } from "@/theme/ThemeProvider";
import { useT } from "@/i18n";
import type { ThemePreference } from "@/domain/theme";

/** Next preference in the cycle: system -> light -> dark -> system. */
export function nextPreference(current: ThemePreference): ThemePreference {
  if (current === "system") return "light";
  return current === "light" ? "dark" : "system";
}

export function ThemeToggle() {
  const t = useT();
  const { preference, setPreference } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setPreference(nextPreference(preference))}
      title={`${t("theme.label")}: ${t(THEME_KEY[preference])}`}
      aria-label={`${t("theme.label")}: ${t(THEME_KEY[preference])}`}
    >
      <ThemeGlyph preference={preference} />
      {/* The value in plain sight: a reader sees what is in effect, and can
          see it change, without opening anything. */}
      <span className="theme-toggle__value">{t(THEME_KEY[preference])}</span>
    </button>
  );
}

const THEME_KEY = {
  system: "theme.system",
  light: "theme.light",
  dark: "theme.dark",
} as const satisfies Record<ThemePreference, string>;

/**
 * Glyphs are decorative: every name is carried by the visible value text and
 * the accessible name above, so a glyph means one thing per state here and
 * never has to mean a thing on its own.
 */
function ThemeGlyph({ preference }: { preference: ThemePreference }) {
  if (preference === "dark") {
    return (
      <svg className="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
        <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" />
      </svg>
    );
  }
  if (preference === "light") {
    return (
      <svg className="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="3.1" />
        <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
      </svg>
    );
  }
  return (
    <svg className="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1" />
      <path d="M8 4.9A3.1 3.1 0 0 1 8 11.1Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default ThemeToggle;
