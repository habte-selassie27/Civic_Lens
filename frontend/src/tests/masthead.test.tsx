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
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services")>();
  return { ...actual, reads: { ...actual.reads, isSample: false, sampleReason: null } };
});

import { Masthead } from "@/components/Masthead";
import { WalletProvider } from "@/genlayer/WalletProvider";

describe("Masthead data-source chip (contract configured)", () => {
  it("reports the configured source without claiming the page is live", () => {
    render(
      <MemoryRouter>
        <WalletProvider>
          <Masthead />
        </WalletProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Live contract configured")).toBeInTheDocument();
    // The page-level label belongs to each surface, never to the chrome.
    expect(screen.queryByText("Live evidence")).toBeNull();
  });
});
