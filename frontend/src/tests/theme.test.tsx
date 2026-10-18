/**
 * Theme preference: system / light / dark.
 *
 * The rules worth protecting are not "the select renders" — they are:
 *  - system follows the OS, and keeps following it while chosen;
 *  - an explicit choice persists and survives a reload;
 *  - a garbage or blocked storage value degrades to system, never to a blank
 *    page;
 *  - the document attribute is what the CSS resolves `light-dark()` against.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  isThemePreference,
  readStoredPreference,
  resolveTheme,
  writeStoredPreference,
} from "@/domain/theme";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

/** A Storage-shaped stub: getItem/setItem only, and it can be made to throw. */
function fakeStorage(initial: Record<string, string> | null = null, throws = false) {
  const store = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (key: string) => {
      if (throws) throw new Error("storage blocked");
      return store.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (throws) throw new Error("storage blocked");
      store.set(key, value);
    },
  };
}

/** Installs a matchMedia stub for prefers-color-scheme. */
function stubPrefersDark(prefersDark: boolean, onChange?: (announce: () => void) => void) {
  const original = window.matchMedia;
  let listeners: Array<(event: MediaQueryListEvent) => void> = [];
  window.matchMedia = ((query: string) =>
    ({
      matches: query.includes("dark") ? prefersDark : false,
      media: query,
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.push(listener);
        onChange?.(() => listeners.forEach((l) => l({} as MediaQueryListEvent)));
      },
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners = listeners.filter((l) => l !== listener);
      },
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

describe("theme preference logic", () => {
  it("recognises only the three known preferences", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("dim")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
  });

  it("resolves system against the OS preference, and leaves explicit choices alone", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    // An explicit choice must NOT be overridden by the OS.
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("reads the stored preference and falls back to system on anything else", () => {
    expect(readStoredPreference(fakeStorage({ [THEME_STORAGE_KEY]: "dark" }))).toBe("dark");
    expect(readStoredPreference(fakeStorage({ [THEME_STORAGE_KEY]: "chartreuse" }))).toBe("system");
    expect(readStoredPreference(fakeStorage())).toBe("system");
    expect(readStoredPreference(null)).toBe("system");
  });

  it("degrades to system when storage throws (private mode, blocked cookies)", () => {
    expect(readStoredPreference(fakeStorage(null, true))).toBe("system");
    // Writing must not throw either: the choice still applies for the session.
    expect(() => writeStoredPreference(fakeStorage(null, true), "dark")).not.toThrow();
    expect(() => writeStoredPreference(null, "dark")).not.toThrow();
  });
});

describe("theme control", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("cycles system -> light -> dark -> system and applies each to the document", async () => {
    const restore = stubPrefersDark(false);
    try {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggle = screen.getByRole("button", { name: /Theme/ });
      expect(toggle).toHaveAccessibleName("Theme: System");
      // The value is readable text, never an icon the reader has to decode.
      expect(toggle.textContent).toContain("System");

      await userEvent.click(toggle);
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
      expect(toggle.textContent).toContain("Light");

      await userEvent.click(toggle);
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
      // Persisted, so a reload keeps it.
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

      await userEvent.click(toggle);
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("system");
      expect(toggle.textContent).toContain("System");
    } finally {
      restore();
    }
  });

  it("always shows the new state, even when the colours do not change yet", async () => {
    // From "system" on a light OS, the first click lands on "light" — which is
    // already what the page shows. The label still moves, so the control never
    // looks like it ignored the click. (A cycling control cannot promise a
    // visible change on every press and still be able to return to "system".)
    const restore = stubPrefersDark(false);
    try {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );
      const toggle = screen.getByRole("button", { name: /Theme/ });

      await userEvent.click(toggle);
      expect(toggle).toHaveAccessibleName("Theme: Light");
      expect(toggle).toHaveTextContent("Light");

      await userEvent.click(toggle);
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
      expect(toggle).toHaveAccessibleName("Theme: Dark");
    } finally {
      restore();
    }
  });

  it("restores a stored choice on mount", () => {
    const restore = stubPrefersDark(true);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
      expect(screen.getByRole("button", { name: /Theme: Dark/ })).toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("keeps following the OS while system is chosen", async () => {
    let flip!: () => void;
    const restore = stubPrefersDark(false, (announce) => {
      flip = announce;
    });
    try {
      const { unmount } = render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );
      // While "system", the attribute stays "system" — the CSS decides via
      // prefers-color-scheme. This asserts the choice is not pinned.
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("system");

      flip();
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("system");
      unmount();
    } finally {
      restore();
    }
  });

  it("renders outside a provider, defaulting to system", () => {
    const restore = stubPrefersDark(false);
    try {
      // Chrome must render in any embedding (a test, a preview, an embed).
      render(<ThemeToggle />);
      expect(screen.getByRole("button", { name: /Theme: System/ })).toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("never leaves the state to an icon alone", async () => {
    // Three preferences, one button: the accessible name must always state
    // which one is in effect, in every state of the cycle.
    const restore = stubPrefersDark(false);
    try {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );
      const toggle = screen.getByRole("button", { name: /Theme/ });
      for (const expected of ["System", "Light", "Dark"]) {
        expect(toggle).toHaveAccessibleName(`Theme: ${expected}`);
        // Readable as text too, so the state survives a screen reader that
        // skips the accessible name and a reader who cannot see the icon.
        expect(toggle).toHaveTextContent(expected);
        await userEvent.click(toggle);
      }
      // Three clicks return to where it started: the cycle is closed, so a
      // reader can always get back to following the OS.
      expect(toggle).toHaveAccessibleName("Theme: System");
      expect(toggle).toHaveTextContent("System");
    } finally {
      restore();
    }
  });
});

describe("theme wiring in the document", () => {
  const html = readFileSync(path.resolve(process.cwd(), "index.html"), "utf8");

  it("declares light and dark to the browser so native controls match", () => {
    expect(html).toMatch(/<meta name="color-scheme" content="light dark"/);
  });

  it("restores the stored theme before first paint", () => {
    // An inline script, not an imported module: a module would arrive after the
    // first paint and flash the light theme at a dark-theme visitor.
    expect(html).toContain("civiclens.theme");
    expect(html).toMatch(/<script>[\s\S]*data-theme[\s\S]*<\/script>/);
    // The stylesheet boot script must exist BEFORE the app module.
    expect(html.indexOf("civiclens.theme")).toBeLessThan(html.indexOf("/src/main.tsx"));
  });

  it("has both theme palettes defined in tokens.css", () => {
    const tokens = readFileSync(path.resolve(process.cwd(), "src/styles/tokens.css"), "utf8");
    expect(tokens).toContain(':root[data-theme="light"]');
    expect(tokens).toContain(':root[data-theme="dark"]');
    expect(tokens).toMatch(/light-dark\(/);
  });

  it("forces the light palette when printing", () => {
    // A dark screen must not print as dark ink on dark paper.
    const app = readFileSync(path.resolve(process.cwd(), "src/styles/app.css"), "utf8");
    expect(app).toMatch(/@media print\s*\{[^}]*color-scheme:\s*only light/);
  });
});
