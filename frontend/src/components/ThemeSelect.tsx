/**
 * Theme control — light / dark / system (UI-CivicLens section 10, dark mode).
 *
 * A native `<select>` rather than a custom menu: keyboard, screen-reader, and
 * mobile behaviour come from the platform, and the option text says which
 * theme is in effect rather than showing an icon that means different things
 * to different people. It is a labeled form control for the same reason the
 * filters are: the current value must be readable, not guessed at.
 */

import { useId } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import { useT } from "@/i18n";
import type { ThemePreference } from "@/domain/theme";

export function ThemeSelect() {
  const t = useT();
  const { preference, setPreference } = useTheme();
  const labelId = useId();

  return (
    <div className="theme-select">
      <label className="theme-select__label" id={labelId} htmlFor="theme-select-input">
        {t("theme.label")}
      </label>
      <select
        id="theme-select-input"
        className="select select--compact"
        aria-labelledby={labelId}
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
      >
        <option value="system">{t("theme.system")}</option>
        <option value="light">{t("theme.light")}</option>
        <option value="dark">{t("theme.dark")}</option>
      </select>
    </div>
  );
}

export default ThemeSelect;
