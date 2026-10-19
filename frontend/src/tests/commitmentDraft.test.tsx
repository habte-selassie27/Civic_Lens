/**
 * The register form must survive a reload and a failed submission.
 *
 * Losing this form means retyping up to five criteria, each with its own
 * measure, threshold and deadline — so the draft is restored, and only the
 * confirmation checkbox is deliberately left unchecked (see domain/draft.ts).
 */

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommitmentNew } from "@/pages/CommitmentNew";
import { WalletProvider } from "@/genlayer/WalletProvider";
import { draftKeyFor, loadDraft, saveDraft, type CommitmentDraftSnapshot } from "@/domain/draft";

const DRAFT: CommitmentDraftSnapshot = {
  subject: "Riverdale Transit Authority",
  subjectKind: "institution",
  registrantRole: "observer",
  statementRef: "https://example.org/pledge",
  commitmentText: "We will publish an annual emissions report.",
  periodStart: "2026-01-01",
  periodEnd: "2026-12-31",
  timezone: "UTC",
  guidance: "Audited reports count.",
  criteria: [
    {
      key: "c1",
      text: "Publish an annual report",
      measure: "A published report covering the period",
      required: true,
      hasThreshold: false,
      threshold: "",
      operator: "gte",
      unit: "",
      deadline: "",
    },
  ],
};

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <WalletProvider>
          <CommitmentNew />
        </WalletProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("register form draft", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("restores an unfinished draft after a reload", async () => {
    saveDraft(draftKeyFor(null), DRAFT);
    renderPage();

    const subject = (await screen.findByRole("textbox", {
      name: /subject required/i,
    })) as HTMLInputElement;
    expect(subject.value).toBe("Riverdale Transit Authority");
    expect(
      (screen.getByLabelText(/link to the source statement/i) as HTMLInputElement).value,
    ).toBe("https://example.org/pledge");
    expect(
      (screen.getByLabelText(/the commitment, as stated/i) as HTMLTextAreaElement).value,
    ).toBe("We will publish an annual emissions report.");
    expect(
      (screen.getByLabelText(/^wording/i) as HTMLTextAreaElement).value,
    ).toBe("Publish an annual report");
  });

  it("says the draft was restored, and that it is not a record", async () => {
    saveDraft(draftKeyFor(null), DRAFT);
    renderPage();

    const note = await screen.findByText(/unfinished draft was restored/i);
    // Reading it must not be mistakable for "something was registered".
    expect(note.textContent).toMatch(/not a record/i);
    expect(note.textContent).toMatch(/nothing is registered until you send it/i);
  });

  it("leaves the confirmation unchecked, because that is an attestation", async () => {
    saveDraft(draftKeyFor(null), DRAFT);
    renderPage();

    const confirm = (await screen.findByRole("checkbox", {
      name: /summary describes what i want reviewed/i,
    })) as HTMLInputElement;
    expect(confirm.checked).toBe(false);
  });

  it("asks for no notice when there is no draft", async () => {
    renderPage();
    await screen.findByRole("textbox", { name: /subject required/i });

    expect(screen.queryByText(/unfinished draft was restored/i)).toBeNull();
  });

  it("keeps a draft that has only just been started", async () => {
    renderPage();
    const user = userEvent.setup();
    const subject = (await screen.findByRole("textbox", {
      name: /subject required/i,
    })) as HTMLInputElement;

    await user.type(subject, "Partway through");

    // The save is debounced, so give it the moment it waits for.
    await new Promise((r) => setTimeout(r, 600));
    expect(loadDraft(draftKeyFor(null))?.subject).toBe("Partway through");
  });

  it("starts over on request: the form empties and the draft is gone", async () => {
    saveDraft(draftKeyFor(null), DRAFT);
    renderPage();
    const user = userEvent.setup();

    // Without this the restored draft would be sticky, with no way back to a
    // blank form.
    await user.click(await screen.findByRole("button", { name: "Start over" }));

    const subject = (await screen.findByRole("textbox", {
      name: /subject required/i,
    })) as HTMLInputElement;
    expect(subject.value).toBe("");
    expect(screen.queryByText(/unfinished draft was restored/i)).toBeNull();

    await new Promise((r) => setTimeout(r, 600));
    // The empty form is what gets saved, so a reload shows an empty form too.
    expect(loadDraft(draftKeyFor(null))?.subject).toBe("");
  });
});
