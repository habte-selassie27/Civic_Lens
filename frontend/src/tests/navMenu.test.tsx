/**
 * NavMenu — the secondary-navigation disclosure.
 *
 * The rules worth protecting are not "it renders a list":
 *  - every reference and monitoring page stays reachable, or the header has a
 *    broken link in it;
 *  - the open state is exposed as `aria-expanded`, so it is not left to
 *    styling or to a reader guessing at a caret;
 *  - Escape closes and hands focus back to the trigger, so a keyboard reader
 *    is never dropped at the top of the page;
 *  - choosing a destination closes the panel;
 *  - the current page is `aria-current`, not a colour.
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { NavMenu } from "@/components/NavMenu";

const ITEMS = [
  { to: "/how-it-works", key: "nav.how_it_works" },
  { to: "/fairness", key: "nav.fairness" },
  { to: "/stats", key: "nav.stats", group: "monitoring" },
  { to: "/status", key: "nav.status", group: "monitoring" },
] as const;

const LABELS = ["How it works", "Fairness", "Platform stats", "System status"];

function renderMenu(path = "/fairness") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<NavMenu items={ITEMS} />} />
        <Route path="/:page" element={<NavMenu items={ITEMS} />} />
      </Routes>
    </MemoryRouter>,
  );
}

function trigger() {
  return screen.getByRole("button", { name: /More/ });
}

describe("NavMenu", () => {
  it("starts closed and says so", () => {
    renderMenu();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    // Nothing rendered yet: a closed panel must not be hiding focusable links
    // at the end of the tab order.
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("opens on click and exposes every secondary destination", async () => {
    renderMenu();
    await userEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(trigger().getAttribute("aria-controls") ?? "");
    expect(panel).not.toBeNull();
    for (const label of LABELS) {
      expect(within(panel as HTMLElement).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    renderMenu();
    const button = trigger();
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(button);
  });

  it("closes when the reader clicks elsewhere", async () => {
    renderMenu();
    await userEvent.click(trigger());
    // A menu left open over the page it belongs to is a trap for a reader
    // who just wanted to read something else.
    await userEvent.click(document.body);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when a destination is chosen", async () => {
    renderMenu();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("link", { name: "Fairness" }));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks exactly one destination current", async () => {
    renderMenu("/stats");
    await userEvent.click(trigger());

    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Platform stats");
  });

  it("starts a new group where the items declare one", async () => {
    renderMenu();
    await userEvent.click(trigger());

    const panel = document.getElementById(trigger().getAttribute("aria-controls") ?? "") as HTMLElement;
    const grouped = panel.querySelectorAll(".navmenu__item--grouped");
    expect(grouped).toHaveLength(2);
    expect(grouped[0]).toHaveTextContent("Platform stats");
    expect(grouped[1]).toHaveTextContent("System status");
  });
});
