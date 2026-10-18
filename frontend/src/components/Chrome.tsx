/**
 * Shared page furniture: footer, banners, error views, empty states, skeletons.
 *
 * Error copy follows section 7.1: say what happened and what to do. No
 * apologies, no "Something went wrong", no raw stack traces. The stable contract
 * string lives in a Details disclosure.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CONTRACT_ADDRESS } from "@/config/contracts";
import { DOCS, explorerAddressUrl } from "@/config/explorer";
import { mapError } from "@/domain/copy";
import { useT } from "@/i18n";
import { ActionButton } from "./DisabledReason";

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

export function Colophon() {
  const t = useT();
  const addressHref = CONTRACT_ADDRESS ? explorerAddressUrl(CONTRACT_ADDRESS) : null;

  return (
    <footer className="colophon">
      <div className="colophon__inner">
        <span>{t("colophon.tagline")}</span>
        <span className="colophon__spacer">
          <Link to="/fairness">{t("colophon.safeguards")}</Link>
        </span>
        <span>
          <a href={DOCS.home} target="_blank" rel="noopener noreferrer">
            {t("colophon.genlayer_docs")}
          </a>
        </span>
        <span>
          {t("colophon.contract")}{" "}
          {addressHref ? (
            <a href={addressHref} target="_blank" rel="noopener noreferrer">
              <code>{CONTRACT_ADDRESS}</code>
            </a>
          ) : (
            <em>{t("colophon.not_deployed")}</em>
          )}
        </span>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Banners                                                                    */
/* -------------------------------------------------------------------------- */

export interface BannerProps {
  title: string;
  children?: ReactNode;
  tone?: "info" | "blocking";
  actions?: ReactNode;
}

/** An announcement that does not block reading. */
export function Banner({ title, children, tone = "info", actions }: BannerProps) {
  return (
    <div className={tone === "blocking" ? "banner banner--blocking" : "banner"} role="status">
      <div style={{ minWidth: 0 }}>
        <p className="banner__title">{title}</p>
        {children && <div>{children}</div>}
        {actions && (
          <div className="actions" style={{ marginTop: "var(--space-2)" }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The sample-data banner. Mandatory whenever the app is not reading a deployed
 * contract — the honest-labeling rule (section 0.8).
 */
export function SampleBanner({ reason }: { reason: string }) {
  const t = useT();
  return (
    <Banner
      title={t("banner.sample_title")}
      tone="blocking"
      actions={
        <Link className="btn btn--small" to="/demo">
          {t("banner.sample_cta")}
        </Link>
      }
    >
      <p>{reason}</p>
      <p>{t("banner.sample_notice")}</p>
    </Banner>
  );
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export interface ErrorViewProps {
  error: unknown;
  onRetry?: () => void;
  /** Shown above the message, e.g. "This commitment could not be read." */
  title?: string;
}

/** Maps an error through domain/copy and offers the right next step. */
export function ErrorView({ error, onRetry, title }: ErrorViewProps) {
  const t = useT();
  const mapped = mapError(error);
  const heading = title ?? t("error.default_title");

  return (
    <div className="fault" role="alert">
      {heading && <p className="banner__title">{heading}</p>}
      <p className="fault__message">{mapped.message}</p>
      {onRetry && (
        <div className="actions" style={{ marginTop: "var(--space-2)" }}>
          <ActionButton variant="quiet" onClick={onRetry}>
            {t("error.retry")}
          </ActionButton>
        </div>
      )}
      <details className="disclosure">
        <summary>{t("error.details")}</summary>
        <p className="fault__detail">{mapped.detail}</p>
      </details>
    </div>
  );
}

/** Shown when reads fail because no contract is configured at all. */
export function ConfigError({ reason }: { reason: string }) {
  const t = useT();
  return (
    <div className="fault" role="alert">
      <p className="banner__title">{t("error.no_contract_title")}</p>
      <p className="fault__message">{reason}</p>
      <p className="hint">
        <code>frontend/.env.example</code> → <code>frontend/.env</code> →{" "}
        <code>VITE_CONTRACT_ADDRESS</code>
      </p>
      <p className="hint">{t("error.no_contract_hint")}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty states and skeletons                                                 */
/* -------------------------------------------------------------------------- */

/** Every list has one that invites action (section 7.4). */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {typeof children === "string" ? <p>{children}</p> : children}
    </div>
  );
}

/** Reads go skeleton -> data. Never a spinner for a read. */
export function Skeleton({ lines = 3, height = "1rem" }: { lines?: number; height?: string }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height, marginBottom: "var(--space-2)", width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function LoadingRegion({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton lines={4} height="1.4rem" />
    </div>
  );
}