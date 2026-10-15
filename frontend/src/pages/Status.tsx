/**
 * System status (config health): `/status`.
 *
 * Checks what a browser CAN verify about this build's configuration, before a
 * user stumbles into the failure: the address is configured, the contract
 * answers a live read, the constants shape matches this frontend, the app is
 * on the intended network, and the wallet state is what it says.
 *
 * It cannot enumerate deployed method names from a client read, so it does
 * not pretend to: the method inventory is listed with the command that
 * actually verifies it against the deployed contract.
 *
 * States are text first ("Matches", "Needs attention", "Info") — colour is
 * never the signal, and the page uses no warning palette by design.
 */

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CONFIGURED, CONTRACT_ADDRESS, READ_METHODS, WRITE_METHODS } from "@/config/contracts";
import { CHAIN_ID, CHAIN_NAME, IS_GASLESS_NETWORK, NETWORK_LABEL, RPC_URL } from "@/config/network";
import { explorerAddressUrl } from "@/config/explorer";
import { inspectConstants } from "@/domain/health";
import { mapError } from "@/domain/copy";
import { shortenAddress } from "@/domain/format";
import type { ContractConstants } from "@/domain/types";
import { reads } from "@/services";
import { useWallet } from "@/genlayer/WalletProvider";
import { LoadingRegion } from "@/components/Chrome";

type CheckState = "ok" | "attention" | "info";

interface CheckRow {
  id: string;
  label: string;
  state: CheckState;
  stateLabel: string;
  detail: ReactNode;
}

interface ReadState {
  loading: boolean;
  error: unknown;
  constants: ContractConstants | null;
  latencyMs: number | null;
}

export function Status() {
  const wallet = useWallet();
  const [attempt, setAttempt] = useState(0);
  const [read, setRead] = useState<ReadState>({
    loading: true,
    error: null,
    constants: null,
    latencyMs: null,
  });

  useEffect(() => {
    let cancelled = false;
    setRead((prev) => ({ ...prev, loading: true, error: null }));
    const started = performance.now();
    reads
      .getConstants()
      .then((constants) => {
        if (cancelled) return;
        setRead({
          loading: false,
          error: null,
          constants,
          latencyMs: Math.max(1, Math.round(performance.now() - started)),
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setRead({ loading: false, error, constants: null, latencyMs: null });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const shape = useMemo(
    () => (read.constants ? inspectConstants(read.constants) : null),
    [read.constants],
  );

  const addressHref = CONFIGURED ? explorerAddressUrl(CONTRACT_ADDRESS) : null;

  const rows: CheckRow[] = [];

  // 1. Address ---------------------------------------------------------------
  rows.push({
    id: "address",
    label: "Contract address",
    state: CONFIGURED ? "ok" : "attention",
    stateLabel: CONFIGURED ? "Configured" : "Not configured",
    detail: CONFIGURED ? (
      <>
        <code>{CONTRACT_ADDRESS}</code>
        {addressHref ? (
          <>
            {" "}
            <a href={addressHref} target="_blank" rel="noopener noreferrer">
              View on the explorer
            </a>
          </>
        ) : null}
      </>
    ) : (
      <>
        No address is set. This build runs on the bundled sample scenarios and
        says so everywhere. Set <code>VITE_CONTRACT_ADDRESS</code> in{" "}
        <code>frontend/.env</code> to read a deployed contract.
      </>
    ),
  });

  // 2. Live read -------------------------------------------------------------
  if (reads.isSample) {
    rows.push({
      id: "read",
      label: "Contract read",
      state: "info",
      stateLabel: "Info",
      detail: "No deployed contract to read in this build — constants come from the bundled snapshot.",
    });
  } else if (read.loading) {
    rows.push({
      id: "read",
      label: "Contract read",
      state: "info",
      stateLabel: "Checking",
      detail: "Reading get_constants…",
    });
  } else if (read.error) {
    const mapped = mapError(read.error);
    rows.push({
      id: "read",
      label: "Contract read",
      state: "attention",
      stateLabel: "Needs attention",
      detail: (
        <>
          <p style={{ margin: 0 }}>{mapped.message}</p>
          <p style={{ margin: "var(--space-1) 0 0" }} className="hint">
            Check the address, the network, and that the endpoint is reachable.{" "}
            <Link to="/commitments">Browse</Link> will fail the same way until this answers.
          </p>
          <details className="disclosure">
            <summary>Details</summary>
            <p className="fault__detail">{mapped.detail}</p>
          </details>
        </>
      ),
    });
  } else {
    rows.push({
      id: "read",
      label: "Contract read",
      state: "ok",
      stateLabel: "Answers",
      detail: `Answered in ${read.latencyMs} ms.`,
    });
  }

  // 3. Constants shape -------------------------------------------------------
  if (reads.isSample) {
    rows.push({
      id: "shape",
      label: "Constants shape",
      state: "info",
      stateLabel: "Info",
      detail: "Checked against the bundled snapshot only — nothing deployed to compare.",
    });
  } else if (shape) {
    const problems = [
      ...shape.missingRequired.map((key) => `required key missing: ${key}`),
      ...shape.enumProblems,
    ];
    if (problems.length > 0) {
      rows.push({
        id: "shape",
        label: "Constants shape",
        state: "attention",
        stateLabel: "Needs attention",
        detail: (
          <>
            <p style={{ margin: 0 }}>
              The address answers, but its constants do not match this frontend:
            </p>
            <ul style={{ margin: "var(--space-1) 0 0", paddingLeft: "1.1rem" }}>
              {problems.map((p) => (
                <li key={p}>
                  <code>{p}</code>
                </li>
              ))}
            </ul>
            <p style={{ margin: "var(--space-1) 0 0" }} className="hint">
              Likely an older or different contract at this address. Point{" "}
              <code>VITE_CONTRACT_ADDRESS</code> at the current build.
            </p>
          </>
        ),
      });
    } else if (shape.missingHardened.length > 0) {
      rows.push({
        id: "shape",
        label: "Constants shape",
        state: "attention",
        stateLabel: "Older build",
        detail: (
          <>
            Answers, but is missing audit fields this frontend can use:{" "}
            <code>{shape.missingHardened.join(", ")}</code>. Retrieval statuses, quote
            limits, and the plain-language semantics will read as absent.
          </>
        ),
      });
    } else {
      rows.push({
        id: "shape",
        label: "Constants shape",
        state: "ok",
        stateLabel: "Matches",
        detail: "Every field this frontend consumes is present, including the audit fields.",
      });
    }
  }

  // 4. Bounds vs the app snapshot --------------------------------------------
  if (shape && !reads.isSample) {
    rows.push({
      id: "bounds",
      label: "Client bounds",
      state: shape.boundDiffs.length === 0 ? "ok" : "info",
      stateLabel: shape.boundDiffs.length === 0 ? "Matches" : "Info",
      detail:
        shape.boundDiffs.length === 0 ? (
          "The app's snapshot matches the deployed bounds."
        ) : (
          <>
            <p style={{ margin: 0 }}>
              {shape.boundDiffs.length} bound{shape.boundDiffs.length === 1 ? "" : "s"}{" "}
              differ from the app's snapshot. Deployed values are authoritative and the app
              uses them:
            </p>
            <ul style={{ margin: "var(--space-1) 0 0", paddingLeft: "1.1rem" }}>
              {shape.boundDiffs.map((d) => (
                <li key={d.key}>
                  <code>
                    {d.key}: app {d.app}, deployed {d.deployed}
                  </code>
                </li>
              ))}
            </ul>
          </>
        ),
    });
  }

  // 5. Network ---------------------------------------------------------------
  rows.push({
    id: "network",
    label: "Network",
    state: "info",
    stateLabel: "Info",
    detail: (
      <>
        {NETWORK_LABEL} · RPC <code>{RPC_URL}</code>
        {IS_GASLESS_NETWORK
          ? " — gasless, so 0 GEN is expected."
          : " — writes need a funded account."}
      </>
    ),
  });

  // 6. Wallet ----------------------------------------------------------------
  if (!wallet.hasProvider) {
    rows.push({
      id: "wallet",
      label: "Wallet",
      state: "info",
      stateLabel: "Info",
      detail: "No wallet extension detected. Reading works without one; writes need a wallet.",
    });
  } else if (!wallet.address) {
    rows.push({
      id: "wallet",
      label: "Wallet",
      state: "info",
      stateLabel: "Info",
      detail: "A wallet is available but no account is connected. Connect from the header to write.",
    });
  } else if (!wallet.isOnCorrectNetwork) {
    rows.push({
      id: "wallet",
      label: "Wallet",
      state: "attention",
      stateLabel: "Needs attention",
      detail: `Connected on a different chain. Reads still work; writes need ${CHAIN_NAME} (chain ${CHAIN_ID}).`,
    });
  } else {
    rows.push({
      id: "wallet",
      label: "Wallet",
      state: "ok",
      stateLabel: "Connected",
      detail: `${shortenAddress(wallet.address)} on ${CHAIN_NAME}.`,
    });
  }

  // 7. Data source -----------------------------------------------------------
  rows.push({
    id: "source",
    label: "Data source",
    state: reads.isSample ? "info" : "ok",
    stateLabel: "Info",
    detail: reads.isSample
      ? `Sample data — ${reads.sampleReason ?? "bundled scenarios"}. Nothing on this build is a finding about a real organization.`
      : "Live evidence from the configured contract. Pages label their own mode.",
  });

  const attention = rows.filter((r) => r.state === "attention").length;

  return (
    <div className="stack-lg">
      <div>
        <h1>System status</h1>
        <p className="hint">
          What this browser can verify about the configuration: the contract address, a live
          read, the constants it answers with, the network, and the wallet. Method names
          cannot be enumerated from a read — that check runs against the saved schema
          (<code>node scripts/save-schema.mjs</code> / <code>genlayer schema</code>).
        </p>
      </div>

      {read.loading && !reads.isSample ? (
        <LoadingRegion label="Running configuration checks" />
      ) : (
        <>
          <p className="hint">
            {attention === 0
              ? "Everything this page can check matches."
              : `${attention} item${attention === 1 ? " needs" : "s need"} attention.`}
          </p>

          <div className="panel panel--flush">
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">
                  Configuration checks with their state and what each one found.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Check</th>
                    <th scope="col">State</th>
                    <th scope="col">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <th scope="row" style={{ fontWeight: 600 }}>
                        {row.label}
                      </th>
                      <td>
                        <span className="tag">{row.stateLabel}</span>
                      </td>
                      <td style={{ maxWidth: "48ch" }}>{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section className="panel" aria-labelledby="methods-heading">
            <div className="panel__head">
              <h2 id="methods-heading">Expected methods</h2>
            </div>
            <div className="panel__body">
              <p className="hint" style={{ marginTop: 0 }}>
                Transcribed from the saved schema (<code>docs/civic_lens.schema.json</code>).
                Verify a deployment answers them with{" "}
                <code>genlayer schema &lt;address&gt;</code>.
              </p>
              <div className="split">
                <div>
                  <p className="ledger__sub">Reads</p>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                    {Object.entries(READ_METHODS).map(([name, method]) => (
                      <li key={name}>
                        <code>{method}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="ledger__sub">Writes</p>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                    {Object.entries(WRITE_METHODS).map(([name, method]) => (
                      <li key={name}>
                        <code>{method}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="actions">
            <button
              type="button"
              className="btn btn--small"
              onClick={() => setAttempt((a) => a + 1)}
              disabled={read.loading}
            >
              Run checks again
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Status;
