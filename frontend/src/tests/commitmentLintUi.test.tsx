/**
 * The register page's lint hints: present while wording is vague, gone once
 * the criterion names a measure and a threshold. Hints never block submission.
 */

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommitmentNew } from "@/pages/CommitmentNew";
import { WalletProvider } from "@/genlayer/WalletProvider";

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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

describe("criteria lint hints on the register page", () => {
  it("shows no hints before anything is typed", async () => {
    renderPage();
    await screen.findByLabelText("Wording");
    expect(screen.queryByText(/Hints, not verdicts/i)).toBeNull();
  });

  it("flags vague wording, then clears once the criterion is specific", async () => {
    renderPage();

    const wording = await screen.findByLabelText("Wording");
    fireEvent.change(wording, { target: { value: "Significantly reduce emissions" } });

    expect(await screen.findByText(/different things to different readers/i)).toBeInTheDocument();
    expect(screen.getByText(/Hints, not verdicts/i)).toBeInTheDocument();
    expect(screen.getByText(/no threshold is set/i)).toBeInTheDocument();
    expect(screen.getByText(/No measure yet/i)).toBeInTheDocument();

    // Make it specific: a measure, a numeric threshold, and a unit.
    fireEvent.change(wording, { target: { value: "Reduce emissions by 10 percent" } });
    fireEvent.change(screen.getByLabelText("How it would be measured"), {
      target: { value: "An audited emissions report states the annual figure" },
    });
    fireEvent.click(screen.getByLabelText(/numeric threshold/i));
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/^Unit/), { target: { value: "percent" } });

    expect(screen.queryByText(/different things to different readers/i)).toBeNull();
    expect(screen.queryByText(/no threshold is set/i)).toBeNull();
    expect(screen.queryByText(/No measure yet/i)).toBeNull();
    expect(screen.queryByText(/Hints, not verdicts/i)).toBeNull();
  });
});
