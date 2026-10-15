/**
 * Router + persistent chrome (UI-CivicLens section 3).
 *
 * Routes mirror the information architecture exactly. The shell provides a skip
 * link, landmarks, and ordered headings for screen readers (section 10).
 */

import { Component, Suspense, lazy, type ErrorInfo, type ReactNode } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/genlayer/WalletProvider";
import { Masthead } from "@/components/Masthead";
import { Colophon, LoadingRegion } from "@/components/Chrome";

/**
 * The landing page ships in the main chunk (it is the entry point); the rest
 * load on navigation. This keeps the SDK and the ledger machinery out of the
 * first paint for someone who only wants the pitch.
 */
import { Landing } from "@/pages/Landing";

const Demo = lazy(() => import("@/pages/Demo"));
const Commitments = lazy(() => import("@/pages/Commitments"));
const CommitmentNew = lazy(() => import("@/pages/CommitmentNew"));
const CommitmentDetail = lazy(() => import("@/pages/CommitmentDetail"));
const Versions = lazy(() => import("@/pages/Versions"));
const Rounds = lazy(() => import("@/pages/Rounds"));
const Activity = lazy(() => import("@/pages/Activity"));
const Stats = lazy(() => import("@/pages/Stats"));
const Status = lazy(() => import("@/pages/Status"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Fairness = lazy(() => import("@/pages/Fairness"));

/** A route that isn't in the information architecture. */
function NotFound() {
  return (
    <div className="stack">
      <h1>That page doesn't exist</h1>
      <p className="hint">
        The link may be out of date. <Link to="/">Back to the start</Link>, or{" "}
        <Link to="/commitments">browse commitments</Link>.
      </p>
    </div>
  );
}

/** Catches a render failure so one broken page never blanks the whole app. */
export class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Never surface a stack trace in the UI; log it for the developer instead.
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="fault" role="alert">
          <p className="banner__title">This page could not be displayed.</p>
          <p className="fault__message">
            Reload to try again. Nothing was submitted and no transaction was sent.
          </p>
          <div className="actions" style={{ marginTop: "var(--space-2)" }}>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <Link className="btn btn--quiet btn--small" to="/">
              Back to the start
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: {
              // Reads are instant; a short window avoids hammering the RPC
              // without showing stale data for long.
              staleTime: 10_000,
              refetchOnWindowFocus: false,
              retry: 1,
            },
          },
        })
      }
    >
      <WalletProvider>
        <div className="shell">
          <a className="skip-link" href="#main">
            Skip to main content
          </a>
          <Masthead />
          <main className="shell__main" id="main">
            <Boundary>
              <Suspense fallback={<LoadingRegion label="Loading page" />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/commitments" element={<Commitments />} />
                  <Route path="/commitments/new" element={<CommitmentNew />} />
                  <Route path="/commitments/:id" element={<CommitmentDetail />} />
                  <Route path="/commitments/:id/supersede" element={<CommitmentNew />} />
                  <Route path="/commitments/:id/rounds" element={<Rounds />} />
                  <Route path="/commitments/:id/versions" element={<Versions />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/status" element={<Status />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/fairness" element={<Fairness />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Boundary>
          </main>
          <Colophon />
        </div>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;