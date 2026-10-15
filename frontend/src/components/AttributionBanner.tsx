/**
 * AttributionBanner (UI-CivicLens 5.5).
 *
 * Always present on every commitment page, never collapsed. Says who registered
 * the entry and in what role, and states plainly that the subject has not
 * necessarily verified or endorsed it.
 *
 * If the subject (or anyone) has responded with evidence or a challenge, that
 * is surfaced too — the right of response has to be visible, not just allowed.
 */

import { Link } from "react-router-dom";
import type { Commitment, ChallengeRecord, EvidenceItem } from "@/domain/types";
import { ROLE_LABEL } from "@/domain/copy";
import { formatDate } from "@/domain/format";
import { CopyField } from "./CopyField";

export interface AttributionBannerProps {
  commitment: Commitment;
  evidence?: EvidenceItem[];
  challenges?: ChallengeRecord[];
}

const SUBJECT_KIND_LABEL: Record<string, string> = {
  organization: "Organization",
  institution: "Public institution",
  individual: "Individual",
};

export function AttributionBanner({ commitment, evidence = [], challenges = [] }: AttributionBannerProps) {
  const roleLabel = ROLE_LABEL[commitment.registrant_role] ?? "as an observer";
  const responses = [
    ...evidence
      .filter((e) => e.submitter.toLowerCase() === commitment.subject.toLowerCase())
      .map((e) => ({ date: e.published_date || e.submitted_at.slice(0, 10), kind: "evidence" as const })),
    ...challenges.map((c) => ({ date: c.opened_at.slice(0, 10), kind: "challenge" as const })),
  ];

  return (
    <div className="attribution">
      <div>
        <p>
          Registered by{" "}
          <CopyField value={commitment.registrant} kind="address" label="registrant address" />{" "}
          {roleLabel}. The subject organization has not necessarily verified or endorsed this
          entry.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <span className="tag">
            Subject: {SUBJECT_KIND_LABEL[commitment.subject_kind] ?? commitment.subject_kind}
          </span>{" "}
          <Link to="/fairness">How CivicLens handles attribution</Link>
        </p>
        {responses.length > 0 && (
          <p style={{ marginTop: "0.5rem" }}>
            A response was recorded on {formatDate(responses[0].date)} (
            {responses[0].kind === "challenge" ? "challenge opened" : "evidence submitted"}).{" "}
            {responses.length > 1 ? `${responses.length - 1} further response(s) on file.` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default AttributionBanner;