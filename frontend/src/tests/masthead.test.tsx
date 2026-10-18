/**
 * Masthead.
 *
 * Two rules worth protecting beyond "it renders":
 *  - the data-source chip states the BUILD's source, never a page's. With a
 *    contract configured it used to read "Live evidence" on every page —
 *    including /demo, where every surface replays a recorded sample and says
 *    "Sample data";
 *  - every destination is inline. A disclosure that hid four pages meant a
 *    reader could not see the app's whole map from the header.
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("Masthead navigation", () => {
  it("shows every destination inline, with nothing hidden behind a disclosure", () => {
    renderMasthead();

    const nav = screen.getByRole("navigation", { name: "Main" });
    const inline = [...nav.querySelectorAll(":scope > a")].map((link) => link.textContent);
    // Core, then reference, then monitoring — the whole map of the app, so a
    // reader never has to guess what exists.
    expect(inline).toEqual([
      "Commitments",
      "Activity",
      "Demo",
      "How it works",
      "Fairness",
      "Platform stats",
      "System status",
    ]);
    // No disclosure control left: if one comes back, a destination is
    // reachable only after an extra click and this list stops matching.
    expect(screen.queryByRole("button", { name: /More/ })).toBeNull();
  });

  it("renders navigation once", () => {
    renderMasthead();
    // One landmark, or a screen-reader's landmark list stops being navigable.
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
  });
});

describe("Masthead reading preferences", () => {
  it("keeps appearance and language together on the reading side", () => {
    renderMasthead();

    // The appearance toggle changes how the whole row is read, so it belongs
    // before the navigation; language sits beside it as a per-reader preference.
    const appearance = screen.getByRole("button", { name: /^Theme/ });
    const nav = screen.getByRole("navigation", { name: "Main" });
    const language = screen.getByRole("button", { name: /Change language/ });

    const lead = appearance.closest(".masthead__lead");
    expect(lead).not.toBeNull();
    expect(lead?.contains(nav)).toBe(true);
    expect(lead?.contains(language)).toBe(true);
  });
});
