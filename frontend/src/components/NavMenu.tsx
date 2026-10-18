/**
 * Secondary navigation — the "More" disclosure.
 *
 * The header carries one line. Core destinations stay inline; reference and
 * monitoring pages (How it works, Fairness, Platform stats, System status)
 * live behind this disclosure, which keeps them one click away without
 * competing with the primary navigation for the same 400px.
 *
 * Why a controlled button rather than `<details><summary>`: the summary's
 * toggle is native browser behaviour that a test environment does not
 * implement, so the panel's open state could never be exercised by a test —
 * and a component whose main behaviour is untestable is a component nobody
 * will notice when it breaks. A button with `aria-expanded` states the same
 * thing to assistive tech and can be driven in a test.
 *
 * This is a DISCLOSURE that reveals links, not a menu, so it deliberately
 * does not use `role="menu"`/`menuitem`: that pattern promises arrow-key
 * navigation and focus wrapping, and ordinary links in a list are what
 * belongs here. Escape closes and returns focus; a click outside closes.
 */

import { useEffect, useId, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useT } from "@/i18n";

export interface NavMenuItem {
  to: string;
  key: string;
  /** Separates groups inside the panel (e.g. reference from monitoring). */
  group?: string;
}

export function NavMenu({ items }: { items: readonly NavMenuItem[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="navmenu" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className="navmenu__button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{t("nav.more")}</span>
        <span className="navmenu__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul className="navmenu__list" id={panelId}>
          {items.map((item, index) => (
            <li
              key={item.to}
              className={
                item.group && index > 0 ? "navmenu__item navmenu__item--grouped" : "navmenu__item"
              }
            >
              <NavLink to={item.to} onClick={() => setOpen(false)}>
                {t(item.key)}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NavMenu;
