/**
 * Entry point.
 *
 * Fonts are self-hosted via @fontsource (no external font host, no CSP
 * dependency): Source Serif 4 for quoted documents, Public Sans for interface.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/400-italic.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";

import "./styles/tokens.css";
import "./styles/app.css";

import { App } from "./App";
import { LocaleProvider } from "./i18n";
import { ThemeProvider } from "./theme/ThemeProvider";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <LocaleProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </LocaleProvider>
  </StrictMode>,
);