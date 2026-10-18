/**
 * AccountPill — the header's account area.
 *
 * The states worth protecting:
 *  - connected: the address, its copy button, and Disconnect are all one
 *    control, and the address is truncated for display but full on hover;
 *  - no provider: the control explains itself instead of offering a button
 *    that cannot work;
 *  - it must never invent a balance (StudioNet is gasless; 0 GEN is expected
 *    and is not a warning).
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountPill } from "@/components/AccountPill";

/** A 40-hex-character address, the shape the chain actually hands out. */
const ADDRESS = "0x5836613b8c4e03b3f35122be6e297c217f224b2d";

const wallet = {
  address: null as string | null,
  isConnected: false,
  hasProvider: true,
  isOnCorrectNetwork: true,
  connect: vi.fn(),
  disconnect: vi.fn(),
  switchNetwork: vi.fn(),
};

vi.mock("@/genlayer/WalletProvider", () => ({
  useWallet: () => wallet,
}));

beforeEach(() => {
  wallet.address = null;
  wallet.isConnected = false;
  wallet.hasProvider = true;
  wallet.connect.mockClear();
  wallet.disconnect.mockClear();
});

describe("AccountPill", () => {
  it("offers to connect when no account is connected", () => {
    render(<AccountPill />);
    expect(screen.getByRole("button", { name: "Connect account" })).toBeInTheDocument();
    // No address, and therefore nothing that could be copied.
    expect(screen.queryByRole("button", { name: /Copy/ })).toBeNull();
  });

  it("says there is no wallet rather than offering a button that cannot work", () => {
    wallet.hasProvider = false;
    render(<AccountPill />);
    const button = screen.getByRole("button", { name: "No wallet" });
    expect(button).toBeDisabled();
  });

  it("groups the address, its copy button, and Disconnect together", () => {
    wallet.address = ADDRESS;
    wallet.isConnected = true;
    render(<AccountPill />);

    const group = screen.getByRole("button", { name: "Disconnect" }).parentElement;
    expect(group).toHaveClass("account");
    // All three live in the one control the header renders.
    expect(within(group as HTMLElement).getByRole("button", { name: /Copy/ })).toBeInTheDocument();
    expect(within(group as HTMLElement).getByText(/^0x583661/)).toBeInTheDocument();
  });

  it("truncates the address for display but keeps the full value reachable", () => {
    wallet.address = ADDRESS;
    wallet.isConnected = true;
    render(<AccountPill />);

    const shown = screen.getByTitle(ADDRESS);
    expect(shown.textContent).not.toBe(ADDRESS);
    expect(shown.textContent).toMatch(/^0x583661…/);
  });

  it("disconnects on request", async () => {
    wallet.address = ADDRESS;
    wallet.isConnected = true;
    render(<AccountPill />);

    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(wallet.disconnect).toHaveBeenCalledOnce();
  });

  it("connects on request", async () => {
    render(<AccountPill />);
    await userEvent.click(screen.getByRole("button", { name: "Connect account" }));
    expect(wallet.connect).toHaveBeenCalledOnce();
  });
});
