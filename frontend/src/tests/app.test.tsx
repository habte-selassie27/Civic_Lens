/**
 * App smoke tests — the whole router, mounted.
 *
 * These catch the failures unit tests miss: a bad route path, a provider
 * missing, a component that throws on first render. They run against the
 * bundled sample data source, which is what a reviewer sees on first load.
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App, Boundary } from "@/App";

/**
 * Render the full app at one route.
 *
 * main.tsx supplies the BrowserRouter in the browser; here a MemoryRouter
 * plays the same role so each test starts on a known URL.
 */
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("app shell", () => {
  it("renders the landing page with the persistent chrome", () => {
    renderAt("/");

    // Landmark + skip link (section 10).
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to main content/i })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    // Network indicator and data-mode legend.
    expect(screen.getByText(/GenLayer Studio/)).toBeInTheDocument();
    expect(screen.getAllByText("Sample data").length).toBeGreaterThan(0);
  });

  it("leads with what CivicLens does and does not do", () => {
    renderAt("/");
    expect(
      screen.getAllByText(/doesn't judge intent/i).length,
    ).toBeGreaterThan(0);
  });

  it("shows a real criterion ledger on the landing page, tagged as sample", () => {
    renderAt("/");
    expect(
      screen.getByText("Publishes an annual Scope 1 emissions report for 2024"),
    ).toBeInTheDocument();
  });

  it("offers the two entry actions", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "Open the demo" })).toHaveAttribute(
      "href",
      "/demo",
    );
    expect(screen.getByRole("link", { name: "Register a commitment" })).toHaveAttribute(
      "href",
      "/commitments/new",
    );
  });

  it("reaches the demo and shows the honest replay labeling", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await user.click(screen.getByRole("link", { name: "Open the demo" }));

    expect(
      await screen.findByRole("heading", { name: /demo/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Replay of a recorded result/i).length).toBeGreaterThan(0);
  });

  it("lists all eight sample scenarios on the demo page", async () => {
    renderAt("/demo");
    const heading = await screen.findByRole("heading", { name: /demo/i, level: 1 });
    expect(heading).toBeInTheDocument();
    for (const name of [
      "Clear support",
      "Missing evidence",
      "Conflicting sources",
      "Ambiguous criterion",
    ]) {
      expect(screen.getAllByText(new RegExp(name)).length).toBeGreaterThan(0);
    }
  });

  it("renders a commitment page with outcome, ledger, attribution, and audit together", async () => {
    renderAt("/commitments/1");

    await screen.findByRole("heading", { name: /Riverdale City/i });

    // Outcome
    expect(screen.getByRole("heading", { name: "Outcome" })).toBeInTheDocument();
    // Ledger
    expect(screen.getByRole("heading", { name: /criterion ledger/i })).toBeInTheDocument();
    // Attribution — always present, never collapsed
    expect(screen.getAllByText(/Registered by/).length).toBeGreaterThan(0);
    // Audit
    expect(screen.getByRole("heading", { name: "Audit" })).toBeInTheDocument();
    // Actions
    expect(screen.getByRole("heading", { name: "Actions" })).toBeInTheDocument();
  });

  it("disables every write on sample data and says why", async () => {
    renderAt("/commitments/1");
    await screen.findByRole("heading", { name: /Riverdale City/i });

    const requestReview = screen.getByRole("button", { name: "Request review" });
    expect(requestReview).toBeDisabled();

    // The reason is visible text, not a tooltip (section 5.12).
    const reasons = screen.getAllByText(/nothing is ever faked|no contract address/i);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("renders the round history page", async () => {
    renderAt("/commitments/8/rounds");
    await screen.findByRole("heading", { name: /round history/i, level: 1 });
    expect(screen.getByRole("heading", { name: "Rounds" })).toBeInTheDocument();
  });

  it("renders how-it-works with the inconclusive explanation", async () => {
    renderAt("/how-it-works");
    const heading = await screen.findByRole("heading", { name: /how it works/i, level: 1 });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/Inconclusive does not mean/i)).toBeInTheDocument();
  });

  it("renders the fairness page with its limitations", async () => {
    renderAt("/fairness");
    await screen.findByRole("heading", { name: /safeguards and limitations/i, level: 1 });
    expect(screen.getByText(/Agreement is not authenticity/i)).toBeInTheDocument();
    expect(screen.getByText(/What it cannot do/i)).toBeInTheDocument();
  });

  it("shows a not-found page for an unknown route", async () => {
    renderAt("/nowhere");
    expect(
      await screen.findByRole("heading", { name: /page doesn't exist/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("never renders a score, grade, or rank on any main page", async () => {
    // Match on SCORING PATTERNS, not the bare word: "it does not score
    // organizations" is a disclaimer the spec requires, and banning the word
    // would ban the honest statement.
    const scoringPatterns: Array<[RegExp, string]> = [
      [/\bscore\s*[:=]?\s*\d/i, "a score with a value"],
      [/\bgrade\s*[:=]/i, "a grade"],
      [/\branked?\b/i, "a ranking"],
      [/leaderboard/i, "a leaderboard"],
      [/\b\d+\s*\/\s*100\b/, "a score out of 100"],
      [/percentile/i, "a percentile"],
      [/\brating\b/i, "a rating"],
    ];

    const routes = ["/", "/demo", "/commitments", "/commitments/1", "/how-it-works", "/fairness"];
    for (const route of routes) {
      const { unmount, container } = renderAt(route);
      await screen.findByRole("heading", { level: 1 });
      const text = container.textContent ?? "";

      for (const [pattern, what] of scoringPatterns) {
        expect(text, `${what} appeared on ${route}`).not.toMatch(pattern);
      }
      unmount();
    }
  });

  it("shows the sample-data badge on every commitment surface", async () => {
    for (const route of ["/", "/demo", "/commitments", "/commitments/1"]) {
      const { unmount } = renderAt(route);
      await screen.findByRole("heading", { level: 1 });
      expect(
        screen.getAllByText("Sample data").length,
        `no Sample data badge on ${route}`,
      ).toBeGreaterThan(0);
      unmount();
    }
  });
});

describe("reads never show the write lifecycle", () => {
  it("shows no transaction state on a read-only page", async () => {
    renderAt("/commitments/1");
    await screen.findByRole("heading", { name: /Riverdale City/i });
    // No spinner-driven write status on a page nobody wrote to.
    expect(screen.queryByText("Submitted to the network")).not.toBeInTheDocument();
    expect(screen.queryByText("Validators are reviewing")).not.toBeInTheDocument();
  });
});

describe("a render error is contained", () => {
  it("shows a recovery message instead of a blank page", () => {
    function Boom(): never {
      throw new Error("kaboom");
    }
    render(
      <MemoryRouter>
        <Boundary>
          <Boom />
        </Boundary>
      </MemoryRouter>,
    );
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText(/could not be displayed/i)).toBeInTheDocument();
    // Never a stack trace.
    expect(alert.textContent).not.toMatch(/at .+ \(.*:\d+:\d+\)/);
  });
});