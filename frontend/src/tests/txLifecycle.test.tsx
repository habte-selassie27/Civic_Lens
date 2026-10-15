/**
 * Transaction lifecycle tests with a mocked service layer (section 12).
 *
 * Covers: phase mapping from receipts, double-submit prevention, in-flight
 * persistence across a reload, and the failure paths. The SDK is never touched —
 * the service interface is mocked, which is the whole reason pages depend on
 * the interface and not on genlayer-js.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTxLifecycle } from "@/hooks/useTxLifecycle";
import { receiptPhase, finalityState, phaseCommitted } from "@/domain/finality";
import type { ReceiptLike } from "@/domain/finality";

/* -------------------------------------------------------------------------- */
/* Receipt mapping                                                             */
/* -------------------------------------------------------------------------- */

describe("receipt -> phase mapping (section 6)", () => {
  const receipt = (over: Partial<ReceiptLike>): ReceiptLike => ({
    status: "ACCEPTED",
    result: "MAJORITY_AGREE",
    ...over,
  });

  it("treats a transient consensus state as pending", () => {
    for (const status of ["PENDING", "PROPOSING", "COMMITTING", "REVEALING", "APPEAL_REVEALING"]) {
      expect(receiptPhase(receipt({ status }))).toBe("pending");
    }
  });

  it("treats ACCEPTED + MAJORITY_AGREE as accepted, NOT final", () => {
    expect(receiptPhase(receipt({ status: "ACCEPTED" }))).toBe("accepted");
    expect(finalityState(receipt({ status: "ACCEPTED" }))).toBe("accepted");
    expect(phaseCommitted("accepted")).toBe(true);
  });

  it("only FINALIZED maps to final", () => {
    expect(receiptPhase(receipt({ status: "FINALIZED" }))).toBe("final");
    expect(finalityState(receipt({ status: "FINALIZED" }))).toBe("final");
  });

  it("never shows a leader error as a successful write", () => {
    const phase = receiptPhase(
      receipt({
        status: "ACCEPTED",
        txExecutionResultName: "FINISHED_WITH_ERROR",
      }),
    );
    expect(phase).toBe("reverted");
    expect(phaseCommitted(phase)).toBe(false);
  });

  it("maps a disagreement to rejected, not to a result", () => {
    expect(receiptPhase(receipt({ status: "FINALIZED", result: "MAJORITY_DISAGREE" }))).toBe(
      "rejected",
    );
  });

  it("maps no-majority and timeouts to dropped", () => {
    expect(receiptPhase(receipt({ status: "FINALIZED", result: "NO_MAJORITY" }))).toBe("dropped");
    expect(receiptPhase(receipt({ status: "VALIDATORS_TIMEOUT" }))).toBe("dropped");
    expect(receiptPhase(receipt({ status: "CANCELED" }))).toBe("dropped");
  });

  it("accepts numeric status codes from a receipt that carries no names", () => {
    // 5 = ACCEPTED, 7 = FINALIZED, 1 = PENDING (genlayer-js enum order).
    expect(receiptPhase({ status: 5, result: 6 })).toBe("accepted");
    expect(receiptPhase({ status: 7, result: 6 })).toBe("final");
    expect(receiptPhase({ status: 1 })).toBe("pending");
  });

  it("treats an unknown receipt as 'not decided yet', never as final", () => {
    expect(finalityState({})).not.toBe("final");
    expect(receiptPhase({ status: "SOMETHING_NEW" })).toBe("pending");
  });
});

/* -------------------------------------------------------------------------- */
/* Lifecycle hook                                                              */
/* -------------------------------------------------------------------------- */

const HASH = `0x${"ab".repeat(32)}` as `0x${string}`;

// Mocked at the service boundary. `writes` is a module-level binding, so the
// module factory must provide the same shape the hook reads.
const mocks = vi.hoisted(() => ({
  getTransaction: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
}));

vi.mock("@/services", async () => {
  const actual = await vi.importActual<typeof import("@/services")>("@/services");
  return {
    ...actual,
    writes: {
      submitEvidence: mocks.writeContract,
      createCommitment: mocks.writeContract,
      requestReview: mocks.writeContract,
      openChallenge: mocks.writeContract,
      getTransaction: mocks.getTransaction,
      waitForAccept: mocks.waitForTransactionReceipt,
    },
    reads: { ...actual.reads, isSample: false, sampleReason: null },
  };
});

function Harness({ label = "Submit" }: { label?: string }) {
  const tx = useTxLifecycle();
  const [log, setLog] = React.useState<string[]>([]);

  return (
    <div>
      <button
        onClick={async () => {
          const r = await tx.start("submit", async () => {
            const hash = await mocks.writeContract();
            return hash as `0x${string}`;
          });
          setLog((prev) => [...prev, r ? "started" : "refused"]);
        }}
      >
        {label}
      </button>
      <p data-testid="phase">{tx.phase}</p>
      <p data-testid="hash">{tx.hash ?? "none"}</p>
      <p data-testid="busy">{String(tx.isBusy)}</p>
      <p data-testid="log">{log.join(",")}</p>
    </div>
  );
}

import React from "react";

describe("useTxLifecycle", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.writeContract.mockReset();
    mocks.getTransaction.mockReset();
    mocks.waitForTransactionReceipt.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stops at 'submitted' then moves to pending, and never claims a result early", async () => {
    mocks.writeContract.mockResolvedValue(HASH);
    let resolveStatus: (r: ReceiptLike) => void = () => {};
    mocks.getTransaction.mockReturnValue(
      new Promise<ReceiptLike>((resolve) => {
        resolveStatus = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(screen.getByTestId("hash")).toHaveTextContent(HASH));
    // The only claim made before a receipt arrives is that it is in flight.
    expect(["submitted", "pending"]).toContain(screen.getByTestId("phase").textContent);
    expect(screen.getByTestId("phase").textContent).not.toBe("accepted");
    expect(screen.getByTestId("phase").textContent).not.toBe("final");

    await act(async () => {
      resolveStatus({ status: "ACCEPTED", result: "MAJORITY_AGREE" });
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByTestId("phase")).toHaveTextContent("accepted"));
  });

  it("prevents double submission", async () => {
    let resolveWrite: (h: string) => void = () => {};
    mocks.writeContract.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveWrite = resolve;
      }),
    );
    mocks.getTransaction.mockResolvedValue({ status: "PENDING" });

    const user = userEvent.setup();
    render(<Harness />);

    const button = screen.getByRole("button", { name: "Submit" });
    await user.click(button);
    // Second click while the first is still awaiting the wallet.
    await user.click(button);

    await act(async () => {
      resolveWrite(HASH);
      await Promise.resolve();
    });

    // The wallet was asked exactly once, no matter how many times the button
    // was clicked.
    expect(mocks.writeContract).toHaveBeenCalledTimes(1);
    const entries = (screen.getByTestId("log").textContent ?? "").split(",");
    expect(entries.filter((e) => e === "started")).toHaveLength(1);
    expect(entries.filter((e) => e === "refused")).toHaveLength(1);
  });

  it("persists an in-flight hash so a reload resumes tracking", async () => {
    mocks.writeContract.mockResolvedValue(HASH);
    mocks.getTransaction.mockResolvedValue({ status: "PENDING" });

    const user = userEvent.setup();
    const first = render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByTestId("hash")).toHaveTextContent(HASH));
    first.unmount();

    // Simulate a reload: the hook re-reads localStorage on mount.
    mocks.getTransaction.mockClear();
    render(<Harness />);
    await waitFor(() => expect(mocks.getTransaction).toHaveBeenCalledWith(HASH));
  });

  it("surfaces a rejected write without claiming success", async () => {
    mocks.writeContract.mockRejectedValue(new Error("EXPECTED: evidence window is closed"));

    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(screen.getByTestId("phase")).toHaveTextContent("rejected"));
    expect(screen.getByTestId("hash")).toHaveTextContent("none");
    expect(screen.getByTestId("busy")).toHaveTextContent("false");
  });

  it("stops polling once the result is final", async () => {
    mocks.writeContract.mockResolvedValue(HASH);
    mocks.getTransaction.mockResolvedValue({ status: "FINALIZED", result: "MAJORITY_AGREE" });

    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(screen.getByTestId("phase")).toHaveTextContent("final"));
    const callsAfterFinal = mocks.getTransaction.mock.calls.length;

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(mocks.getTransaction.mock.calls.length).toBe(callsAfterFinal);
  });
});