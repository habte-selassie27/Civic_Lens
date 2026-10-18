/**
 * Persistent chrome (UI-CivicLens section 3): network indicator, account state,
 * reading preferences, and the data-mode legend. Present on every page.
 */

import { Link, NavLink } from "react-router-dom";
import { NETWORK_LABEL } from "@/config/network";
import { APP_SOURCE_LABEL, APP_SOURCE_TITLE } from "@/domain/copy";
import { useWallet } from "@/genlayer/WalletProvider";
import { reads } from "@/services";
import { useT } from "@/i18n";
import { CopyField } from "./CopyField";
import { LanguageButton } from "./LanguageButton";
import { ThemeSelect } from "./ThemeSelect";

const NAV = [
  { to: "/commitments", key: "nav.commitments" },
  { to: "/activity", key: "nav.activity" },
  { to: "/demo", key: "nav.demo" },
  { to: "/how-it-works", key: "nav.how_it_works" },
  { to: "/fairness", key: "nav.fairness" },
  { to: "/stats", key: "nav.stats" },
  { to: "/status", key: "nav.status" },
] as const;

export function Masthead() {
  const t = useT();
  const wallet = useWallet();
  const appIsSample = reads.isSample;
  const network = NETWORK_LABEL.split(" · ")[0];

  return (
    <header className="masthead">
      <div className="masthead__inner">
        <Link to="/" className="wordmark">
          <span className="wordmark__rule" aria-hidden="true" />
          CivicLens
        </Link>

        <nav className="masthead__nav" aria-label={t("nav.main")}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="masthead__state">
          {/* Appearance and language belong in the chrome: both are reading
              preferences that persist across pages, and neither affects what
              the evidence says. */}
          <ThemeSelect />
          <LanguageButton />
          {/* Chrome states the build's data SOURCE; pages state their own
              mode. Claiming "Live evidence" here would contradict every
              sample surface on a replay page like /demo. */}
          <span
            className={`badge badge--${appIsSample ? "sample" : "live"}`}
            title={appIsSample ? APP_SOURCE_TITLE.sampleOnly : APP_SOURCE_TITLE.configured}
          >
            <span className="badge__swatch" aria-hidden="true" />
            {appIsSample ? APP_SOURCE_LABEL.sampleOnly : APP_SOURCE_LABEL.configured}
          </span>
          <span title={NETWORK_LABEL}>{network}</span>
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
              <p className="banner__title">{t("banner.wrong_network_title")}</p>
              <p>{t("banner.wrong_network_body", { network })}</p>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => void wallet.switchNetwork()}
                >
                  {t("banner.switch_network", { network })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No balance banner here on purpose: reading an account balance needs a
          verified SDK method, and this build does not have one. StudioNet is
          gasless, so 0 GEN is expected and must NOT be warned about. On a funded
          network a write surfaces the faucet link in its own error. */}
    </header>
  );
}

export default Masthead;
