/**
 * Persistent chrome (UI-CivicLens section 3): network indicator, account state,
 * reading preferences, and the data-mode legend. Present on every page.
 *
 * Layout is three groups in one row, left to right:
 *
 *   [wordmark] [core navigation] · [source status] [appearance] [language] [account]
 *
 * Reading left to right: where you are, then what you can do about it. Core
 * destinations (Commitments, Activity, Demo) stay inline because they are what
 * most readers came for; reference and monitoring pages sit behind the "More"
 * disclosure so they are one click away without competing for the same line.
 * A hairline rule separates navigation from account chrome — without it the
 * controls read as part of the navigation and the bar has no hierarchy.
 *
 * The status pill states the BUILD's data source (contract configured, or a
 * sample-only build), never a page's: claiming "Live evidence" here would
 * contradict every sample surface on a replay page like /demo.
 */

import { Link, NavLink } from "react-router-dom";
import { NETWORK_LABEL } from "@/config/network";
import { APP_SOURCE_LABEL } from "@/domain/copy";
import { useWallet } from "@/genlayer/WalletProvider";
import { reads } from "@/services";
import { useT } from "@/i18n";
import { AccountPill } from "./AccountPill";
import { LanguageButton } from "./LanguageButton";
import { NavMenu } from "./NavMenu";
import { ThemeToggle } from "./ThemeToggle";

/** Core navigation: inline, one row, always visible. */
const PRIMARY_NAV = [
  { to: "/commitments", key: "nav.commitments" },
  { to: "/activity", key: "nav.activity" },
  { to: "/demo", key: "nav.demo" },
] as const;

/**
 * Reference and monitoring pages, behind "More". `group` starts a new group
 * inside the panel — reference first, then the pages that watch the platform.
 */
const SECONDARY_NAV = [
  { to: "/how-it-works", key: "nav.how_it_works", group: "reference" },
  { to: "/fairness", key: "nav.fairness", group: "reference" },
  { to: "/stats", key: "nav.stats", group: "monitoring" },
  { to: "/status", key: "nav.status", group: "monitoring" },
] as const;

export function Masthead() {
  const t = useT();
  const wallet = useWallet();
  const appIsSample = reads.isSample;
  const network = NETWORK_LABEL.split(" · ")[0];
  const sourceLabel = appIsSample ? APP_SOURCE_LABEL.sampleOnly : APP_SOURCE_LABEL.configured;

  return (
    <header className="masthead">
      <div className="masthead__inner">
        <div className="masthead__lead">
          <Link to="/" className="wordmark">
            <span className="wordmark__rule" aria-hidden="true" />
            CivicLens
          </Link>

          <nav className="masthead__nav" aria-label={t("nav.main")}>
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {t(item.key)}
              </NavLink>
            ))}
            <NavMenu items={SECONDARY_NAV} />
          </nav>
        </div>

        <div className="masthead__tools">
          {/* Compact source status: the network name is what a reader scans
              for; the full source sentence stays on the title and for screen
              readers, so the pill is small without becoming vague. */}
          <span
            className={`badge badge--${appIsSample ? "sample" : "live"}`}
            title={`${sourceLabel} · ${network}`}
          >
            <span className="badge__swatch" aria-hidden="true" />
            <span className="sr-only">{sourceLabel}</span>
            {network}
          </span>

          {/* Appearance and language belong in the chrome: both are reading
              preferences that persist across pages, and neither affects what
              the evidence says. */}
          <ThemeToggle />
          <LanguageButton />
          <AccountPill />
        </div>
      </div>

      {/* Wrong network is blocking: reads still work, writes do not. */}
      {wallet.isConnected && !wallet.isOnCorrectNetwork && (
        <div className="masthead__notice">
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
