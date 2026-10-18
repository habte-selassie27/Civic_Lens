/**
 * Masthead data-source chip.
 *
 * Regression guard: with a contract configured, the chrome used to read
 * "Live evidence" on every page — including /demo, where every surface
 * replays a recorded sample and says "Sample data". The chrome states the
 * BUILD's data source ("Live contract configured"); pages state their own
 * mode. The chrome must never claim a page is live when it is not.
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services")>();
  return { ...actual, reads: { ...actual.reads, isSample: false, sampleReason: null } };
});

import { Masthead } from "@/components/Masthead";
import { WalletProvider } from "@/genlayer/WalletProvider";

function renderMasthead() {
  return render(
    <MemoryRouter>
      <WalletProvider>
        <Masthead />
      </WalletProvider>
    </MemoryRouter>,
  );
}

describe("Masthead data-source chip (contract configured)", () => {
  it("reports the configured source without claiming the page is live", () => {
    renderMasthead();

    expect(screen.getByText("Live contract configured")).toBeInTheDocument();
    // The page-level label belongs to each surface, never to the chrome.
    expect(screen.queryByText("Live evidence")).toBeNull();
  });

  it("states the build's source in words, not only in a coloured dot", () => {
    renderMasthead();

    const pill = screen.getByTitle(/Live contract configured/);
    // Never colour alone (section 5.2): the source is in the accessible text,
    // and the pill carries the swatch as decoration beside it.
    expect(pill).toHaveTextContent("GenLayer Studio");
    expect(pill.querySelector(".badge__swatch")).not.toBeNull();
    // The full sentence stays reachable for assistive technology.
    expect(pill.textContent).toContain("Live contract configured");
  });
});

describe("Masthead navigation hierarchy", () => {
  it("keeps core destinations inline and reference pages behind More", async () => {
    renderMasthead();

    const nav = screen.getByRole("navigation", { name: "Main" });
    // Only direct children count as "inline": a closed <details> still holds
    // its links in the document, so a naive query over the whole nav would
    // report the hidden ones as visible.
    const inline = [...nav.querySelectorAll(":scope > a")].map((link) => link.textContent);
    expect(inline).toEqual(["Commitments", "Activity", "Demo"]);

    // The rest must still be reachable — one click away, not gone. A closed
    // panel renders nothing, so the links are only queryable once open.
    await userEvent.click(screen.getByRole("button", { name: /More/ }));
    const panel = document.querySelector(".navmenu__list") as HTMLElement;
    for (const label of ["How it works", "Fairness", "Platform stats", "System status"]) {
      expect(within(panel).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("renders navigation once", () => {
    renderMasthead();
    // One landmark, or a screen-reader's landmark list stops being navigable.
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
  });
});
