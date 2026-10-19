/**
 * The write path must carry the connected account.
 *
 * Regression this pins: LiveService built its SDK client with the account left
 * out, so every write died inside the SDK ("No account set. Configure the
 * client with an account…") *before the wallet was ever asked* — while the
 * header showed a connected address the whole time. Reads were unaffected,
 * which is why the failure looked like a consensus problem.
 *
 * Two properties are load-bearing:
 *   1. a write with no connected account refuses in plain words, up front;
 *   2. a write with one hands the *current* address to the SDK — the account
 *      is re-read per write, so switching accounts in the wallet cannot leave
 *      a stale client signing from the old address.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const ADDRESS_A = "0x5b3661c576c7001e6d6279c67f3779705d334c89";
const ADDRESS_B = "0x1111111111111111111111111111111111111111";
const CONTRACT = "0xA8cc5b18C4ED3b3F5122bE02c972C17f224b27d6";

/** Every SDK client the service built, in order. */
const clients: Array<{ address: string; account?: string; endpoint?: string }> = [];
const createCommitment = vi.fn(async () => "0xhash" as `0x${string}`);

vi.mock("@/config/contracts", async () => {
  const actual = await vi.importActual<typeof import("@/config/contracts")>("@/config/contracts");
  return { ...actual, CONTRACT_ADDRESS: CONTRACT, CONFIGURED: true };
});

vi.mock("@/genlayer/CivicLens", () => ({
  default: class {
    constructor(address: string, account?: string | null, endpoint?: string) {
      clients.push({ address, account: account ?? undefined, endpoint });
    }
    createCommitment = createCommitment;
    getConstants = vi.fn();
  },
}));

const { createLiveService, setActiveAccount, NoAccountError } = await import("@/services/live");

const input = {
  subject: "Riverdale Transit Authority",
  subjectKind: "institution",
  registrantRole: "observer",
  sourceStatementRef: "https://example.org/a",
  commitmentText: "We will publish a report.",
  periodStart: "2026-01-01",
  periodEnd: "2026-12-31",
  timezone: "UTC",
  sourceGuidance: "Audited reports count.",
  dataMode: "live",
  criteriaJson: "[]",
} as unknown as Parameters<ReturnType<typeof createLiveService>["createCommitment"]>[0];

describe("LiveService writes", () => {
  beforeEach(() => {
    clients.length = 0;
    createCommitment.mockClear();
    setActiveAccount(null);
  });

  it("refuses a write with no connected account, without calling the SDK", async () => {
    const service = createLiveService();

    await expect(service.createCommitment(input)).rejects.toBeInstanceOf(NoAccountError);
    expect(createCommitment).not.toHaveBeenCalled();
  });

  it("says what to do, rather than leaking the SDK's message", async () => {
    const service = createLiveService();

    // The SDK's own words ("No account set. Configure the client with an
    // account or pass an account to this function.") name an internal API the
    // reader has no way to act on.
    await expect(service.createCommitment(input)).rejects.toThrow(/connect an account/i);
  });

  it("hands the connected account to the SDK", async () => {
    setActiveAccount(ADDRESS_A);
    const service = createLiveService();

    await service.createCommitment(input);

    expect(createCommitment).toHaveBeenCalledTimes(1);
    const writeClient = clients.at(-1);
    expect(writeClient?.account).toBe(ADDRESS_A);
    expect(writeClient?.address).toBe(CONTRACT);
  });

  it("re-reads the account per write, so a switch cannot sign from the old one", async () => {
    setActiveAccount(ADDRESS_A);
    const service = createLiveService();
    await service.createCommitment(input);

    setActiveAccount(ADDRESS_B);
    await service.createCommitment(input);

    expect(clients.at(-1)?.account).toBe(ADDRESS_B);
    expect(clients.filter((c) => c.account === ADDRESS_B)).toHaveLength(1);
  });

  it("keeps reading with no account connected", async () => {
    const service = createLiveService();

    // Reads are the half of the app that must work for a reader who has not
    // connected anything; only writes need an account.
    await expect(service.getConstants()).resolves.toBeUndefined();
    const readClient = clients[0];
    expect(readClient?.account).toBeUndefined();
    expect(readClient?.address).toBe(CONTRACT);
  });
});
