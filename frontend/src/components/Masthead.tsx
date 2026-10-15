/**
 * Persistent chrome (UI-CivicLens section 3): network indicator, account state,
 * and the data-mode legend. Present on every page.
 */

import { Link, NavLink } from "react-router-dom";
import { NETWORK_LABEL } from "@/config/network";
import { useWallet } from "@/genlayer/WalletProvider";
import { reads } from "@/services";
import { DataModeBadge } from "./DataModeBadge";
import { CopyField } from "./CopyField";

const NAV = [
  { to: "/commitments", label: "Commitments" },
  { to: "/demo", label: "Demo" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/fairness", label: "Fairness" },
];

export function Masthead() {
  const wallet = useWallet();
  const appIsSample = reads.isSample;

  return (
    <header className="masthead">
      <div className="masthead__inner">
        <Link to="/" className="wordmark">
          <span className="wordmark__rule" aria-hidden="true" />
          CivicLens
        </Link>

        <nav className="masthead__nav" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="masthead__state">
          <DataModeBadge mode="live" override={appIsSample ? "sample" : "live"} />
          <span title={NETWORK_LABEL}>{NETWORK_LABEL.split(" · ")[0]}</span>
          {wallet.isConnected && wallet.address ? (
            <>
              <CopyField value={wallet.address} kind="address" label="account address" />
              <button type="button" className="btn btn--quiet btn--small" onClick={wallet.disconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn--quiet btn--small"
              onClick={() => void wallet.connect()}
              disabled={!wallet.hasProvider}
            >
              {wallet.hasProvider ? "Connect account" : "No wallet"}
            </button>
          )}
        </div>
      </div>

      {/* Wrong network is blocking: reads still work, writes do not. */}
      {wallet.isConnected && !wallet.isOnCorrectNetwork && (
        <div style={{ padding: "0 var(--space-4) var(--space-3)" }}>
          <div className="banner banner--blocking" role="alert">
            <div>
              <p className="banner__title">This wallet is on the wrong network.</p>
              <p>
                CivicLens reads and writes on {NETWORK_LABEL}. Reading works either way; a write
                needs the switch below.
              </p>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => void wallet.switchNetwork()}
                >
                  Switch to {NETWORK_LABEL.split(" · ")[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No balance banner here on purpose: reading an account balance needs a
          verified SDK method, and this build does not have one. StudioNet is
          gasless, so 0 GEN is expected and must NOT be warned about. On a funded
          network a failed write surfaces the faucet link in its own error. */}
    </header>
  );
}

export default Masthead;