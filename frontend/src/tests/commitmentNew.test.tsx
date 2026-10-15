/**
 * Register page environment states (UI-CivicLens 7.3).
 *
 * Regression: the form used to cast the numeric-only fallback bounds as a full
 * `ContractConstants`, so a failed `get_constants` query (bad address,
 * unreachable RPC, mid-edit .env) crashed the page with
 * "Cannot read properties of undefined (reading 'filter')" instead of
 * explaining what happened and offering a retry.
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services")>();
  return {
    ...actual,
    reads: {
      ...actual.reads,
      isSample: false,
      sampleReason: null,
      getConstants: () =>
        Promise.reject(new Error("EXTERNAL: contract unreachable at this address")),
    },
  };
});

import { CommitmentNew } from "@/pages/CommitmentNew";
import { WalletProvider } from "@/genlayer/WalletProvider";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <WalletProvider>
          <CommitmentNew />
        </WalletProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("CommitmentNew when get_constants fails", () => {
  it("explains the failure and offers a retry instead of crashing", async () => {
    renderPage();
    expect(
      await screen.findByText("The contract's limits could not be read.", undefined, {
        timeout: 5000,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    // No half-built form: no subject-kind select, no submit button.
    expect(screen.queryByLabelText(/subject kind/i)).toBeNull();
  });

  it("maps the failure through the error taxonomy, not a stack trace", async () => {
    renderPage();
    expect(
      await screen.findByText(/couldn't be reached/i, undefined, { timeout: 5000 }),
    ).toBeInTheDocument();
  });
});
