/**
 * Persistent chrome (UI-CivicLens section 3): network indicator, account state,
 * reading preferences, and the data-mode legend. Present on every page.
 *
 * Layout is two groups in one row, left to right:
 *
 *   [wordmark] [appearance] [navigation] [source status] [wallet] · [language]
 *
 * Reading left to right: where you are, what you're reading it as, where you
 * can go — then the source status and wallet connect, placed beside the
 * "System status" entry at the far right of the navbar. The language control
 * stays on the right of the hairline as the lone per-reader preference. All
 * seven destinations are inline: a reader should be able to see the whole map
 * of the app at once rather than hunting behind a disclosure.
 *
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
import { ThemeToggle } from "./ThemeToggle";

/** Every destination, inline in one row: core first, then reference, monitoring. */
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
  const sourceLabel = appIsSample ? APP_SOURCE_LABEL.sampleOnly : APP_SOURCE_LABEL.configured;

  return (
    <header className="masthead">
      <div className="masthead__inner">
        <div className="masthead__lead">
          <Link to="/" className="wordmark">
            <span className="wordmark__rule" aria-hidden="true" />
            CivicLens
          </Link>

          {/* Appearance before the navigation: it changes how the whole row
              is read, so it belongs on the reading side of the hairline. */}
          <ThemeToggle />
          <nav className="masthead__nav" aria-label={t("nav.main")}>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          {/* Wallet connect button and network name sit beside the "System
              status" entry, outside the navbar, in their own place. They are
              one group so a narrower window drops them together rather than
              leaving the network chip orphaned on a line of its own. */}
          <div className="masthead__chrome">
            <AccountPill />
            <span
              className={`badge badge--${appIsSample ? "sample" : "live"}`}
              title={`${sourceLabel} · ${network}`}
            >
              <span className="badge__swatch" aria-hidden="true" />
              <span className="sr-only">{sourceLabel}</span>
              {network}
            </span>
          </div>

          {/* Language sits beside the wallet group as a per-reader preference,
              separated from the wallet by a hairline so the row reads as: nav,
              wallet + network, language. */}
          <div className="masthead__lang">
            <span className="masthead__lang__rule" aria-hidden="true" />
            <LanguageButton />
          </div>
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
