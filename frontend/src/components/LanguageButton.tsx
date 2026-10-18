/**
 * Language control — the translation button.
 *
 * A menu of the available locales, each shown in its own language (endonym),
 * which is the convention that lets a reader find their language without
 * having to know English. Behaviour follows the WAI-ARIA menu-button pattern:
 * Escape closes and returns focus, an outside click closes, arrow keys move
 * between options.
 *
 * The menu says the translations are drafts. That is not decoration — they were
 * written without a native-speaker reviewer, and a reader deserves to know what
 * they are looking at.
 */

import { useEffect, useId, useRef, useState } from "react";
import { LOCALES, t, useLocale } from "@/i18n";

export function LanguageButton() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const current = LOCALES.find((entry) => entry.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (next: (typeof LOCALES)[number]["code"]) => {
    setLocale(next);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[role='menuitemradio']"),
    );
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
  };

  return (
    <div className="language" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn--quiet btn--small language__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("language.switch")}
        onClick={() => setOpen((value) => !value)}
      >
        <GlobeMark aria-hidden="true" />
        <span>{current.endonym}</span>
      </button>

      {open && (
        <div className="language__menu" id={menuId} role="menu" aria-label={t("language.label")}>
          <ul className="language__list" onKeyDown={onMenuKeyDown}>
            {LOCALES.map((entry) => (
              <li key={entry.code}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={entry.code === locale}
                  className="language__item"
                  lang={entry.code}
                  onClick={() => choose(entry.code)}
                >
                  <span className="language__endonym">{entry.endonym}</span>
                  <span className="language__name">{entry.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="language__note">{t("language.draft_note")}</p>
        </div>
      )}
    </div>
  );
}

/** Globe glyph: a circle with a meridian and a parallel, inline SVG. */
function GlobeMark({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "icon"}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.6 4 5.5 4 8.5s-1.4 5.9-4 8.5c-2.6-2.6-4-5.5-4-8.5s1.4-5.9 4-8.5Z" />
    </svg>
  );
}

export default LanguageButton;
