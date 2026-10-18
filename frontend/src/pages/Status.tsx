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
import { useT } from "@/i18n";
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
  const t = useT();
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
    label: t("statuspage.check_address"),
    state: CONFIGURED ? "ok" : "attention",
    stateLabel: CONFIGURED ? t("statuspage.state_configured") : t("statuspage.state_not_configured"),
    detail: CONFIGURED ? (
      <>
        <code>{CONTRACT_ADDRESS}</code>
        {addressHref ? (
          <>
            {" "}
            <a href={addressHref} target="_blank" rel="noopener noreferrer">
              {t("statuspage.address_view")}
            </a>
          </>
        ) : null}
      </>
    ) : (
      <>
        {t("statuspage.address_missing")}
      </>
    ),
  });

  // 2. Live read -------------------------------------------------------------
  if (reads.isSample) {
    rows.push({
      id: "read",
      label: t("statuspage.check_read"),
      state: "info",
      stateLabel: t("statuspage.state_info"),
      detail: t("statuspage.read_sample"),
    });
  } else if (read.loading) {
    rows.push({
      id: "read",
      label: "Contract read",
      state: "info",
      stateLabel: t("statuspage.state_checking"),
      detail: t("statuspage.read_checking"),
    });
  } else if (read.error) {
    const mapped = mapError(read.error);
    rows.push({
      id: "read",
      label: "Contract read",
      state: "attention",
      stateLabel: t("statuspage.state_attention"),
      detail: (
        <>
          <p style={{ margin: 0 }}>{mapped.message}</p>
          <p style={{ margin: "var(--space-1) 0 0" }} className="hint">
            {t("statuspage.read_error_hint_prefix")} <Link to="/commitments">{t("statuspage.read_browse_link")}</Link>{" "}
            {t("statuspage.read_error_hint_suffix")}
          </p>
          <details className="disclosure">
            <summary>{t("error.details")}</summary>
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
      stateLabel: t("statuspage.state_answers"),
      detail: t("statuspage.read_answered", { ms: read.latencyMs ?? 0 }),
    });
  }

  // 3. Constants shape -------------------------------------------------------
  if (reads.isSample) {
    rows.push({
      id: "shape",
      label: t("statuspage.check_shape"),
      state: "info",
      stateLabel: t("statuspage.state_info"),
      detail: t("statuspage.shape_sample"),
    });
  } else if (shape) {
    const problems = [
      ...shape.missingRequired.map((key) => t("statuspage.shape_missing_key", { key })),
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
              {t("statuspage.shape_mismatch_intro")}
            </p>
            <ul style={{ margin: "var(--space-1) 0 0", paddingLeft: "1.1rem" }}>
              {problems.map((p) => (
                <li key={p}>
                  <code>{p}</code>
                </li>
              ))}
            </ul>
            <p style={{ margin: "var(--space-1) 0 0" }} className="hint">
              {t("statuspage.shape_mismatch_hint")}
            </p>
          </>
        ),
      });
    } else if (shape.missingHardened.length > 0) {
      rows.push({
        id: "shape",
        label: "Constants shape",
        state: "attention",
        stateLabel: t("statuspage.state_older"),
        detail: (
          <>
            <p style={{ margin: 0 }}>{t("statuspage.shape_older_detail", { fields: shape.missingHardened.join(", ") })}</p>
            <p className="hint">{t("statuspage.shape_older_tail")}</p>
          </>
        ),
      });
    } else {
      rows.push({
        id: "shape",
        label: "Constants shape",
        state: "ok",
        stateLabel: t("statuspage.state_matches"),
        detail: t("statuspage.shape_ok"),
      });
    }
  }

  // 4. Bounds vs the app snapshot --------------------------------------------
  if (shape && !reads.isSample) {
    rows.push({
      id: "bounds",
      label: t("statuspage.check_bounds"),
      state: shape.boundDiffs.length === 0 ? "ok" : "info",
      stateLabel: shape.boundDiffs.length === 0 ? t("statuspage.state_matches") : t("statuspage.state_info"),
      detail:
        shape.boundDiffs.length === 0 ? (
          t("statuspage.bounds_ok")
        ) : (
          <>
            <p style={{ margin: 0 }}>
              {t("statuspage.bounds_differ", { count: shape.boundDiffs.length })}
            </p>
            <ul style={{ margin: "var(--space-1) 0 0", paddingLeft: "1.1rem" }}>
              {shape.boundDiffs.map((d) => (
                <li key={d.key}>
                  <code>
                    {t("statuspage.bounds_line", { key: d.key, app: d.app, deployed: d.deployed })}
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
    label: t("statuspage.check_network"),
    state: "info",
    stateLabel: "Info",
    detail: (
      <>
        {NETWORK_LABEL} · RPC <code>{RPC_URL}</code>
        {IS_GASLESS_NETWORK
          ? t("statuspage.network_gasless")
          : t("statuspage.network_funded")}
      </>
    ),
  });

  // 6. Wallet ----------------------------------------------------------------
  if (!wallet.hasProvider) {
    rows.push({
      id: "wallet",
      label: t("statuspage.check_wallet"),
      state: "info",
      stateLabel: t("statuspage.state_info"),
      detail: t("statuspage.wallet_none"),
    });
  } else if (!wallet.address) {
    rows.push({
      id: "wallet",
      label: "Wallet",
      state: "info",
      stateLabel: t("statuspage.state_info"),
      detail: t("statuspage.wallet_no_account"),
    });
  } else if (!wallet.isOnCorrectNetwork) {
    rows.push({
      id: "wallet",
      label: "Wallet",
      state: "attention",
      stateLabel: t("statuspage.state_attention"),
      detail: t("statuspage.wallet_wrong_chain", { chain: CHAIN_NAME, chainId: CHAIN_ID }),
    });
  } else {
    rows.push({
      id: "wallet",
      label: "Wallet",
      state: "ok",
      stateLabel: t("statuspage.state_connected"),
      detail: t("statuspage.wallet_ok", { address: shortenAddress(wallet.address), chain: CHAIN_NAME }),
    });
  }

  // 7. Data source -----------------------------------------------------------
  rows.push({
    id: "source",
    label: t("statuspage.check_source"),
    state: reads.isSample ? "info" : "ok",
    stateLabel: reads.isSample ? t("statuspage.state_info") : t("statuspage.state_matches"),
    detail: reads.isSample
      ? t("statuspage.source_sample", { reason: reads.sampleReason ?? t("statuspage.source_sample_default") })
      : t("statuspage.source_live"),
  });

  const attention = rows.filter((r) => r.state === "attention").length;

  return (
    <div className="stack-lg">
      <div>
        <h1>{t("statuspage.title")}</h1>
        <p className="hint">{t("statuspage.lede")}</p>
      </div>

      {read.loading && !reads.isSample ? (
        <LoadingRegion label={t("statuspage.loading")} />
      ) : (
        <>
          <p className="hint">
            {attention === 0
              ? t("statuspage.all_ok")
              : t("statuspage.needs_attention", { count: attention })}
          </p>

          <div className="panel panel--flush">
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">{t("statuspage.caption")}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t("statuspage.col_check")}</th>
                    <th scope="col">{t("statuspage.col_state")}</th>
                    <th scope="col">{t("statuspage.col_detail")}</th>
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
              <h2 id="methods-heading">{t("statuspage.methods_heading")}</h2>
            </div>
            <div className="panel__body">
              <p className="hint" style={{ marginTop: 0 }}>
                {t("statuspage.methods_hint")}
              </p>
              <div className="split">
                <div>
                  <p className="ledger__sub">{t("statuspage.methods_reads")}</p>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                    {Object.entries(READ_METHODS).map(([name, method]) => (
                      <li key={name}>
                        <code>{method}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="ledger__sub">{t("statuspage.methods_writes")}</p>
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
              {t("statuspage.rerun")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Status;
