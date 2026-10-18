/**
 * Indexer config — the optional read index (see indexer/ in this repo).
 *
 * When VITE_INDEXER_URL is unset or not an http(s) URL, the app never
 * contacts an index and every page keeps its contract-only behaviour (the
 * browse page's scope note, the stats window note). When it is set, search
 * and stats may use the index — and must say when it was last updated,
 * because an index is a cache of the chain, not the chain.
 */

const RAW = (import.meta.env.VITE_INDEXER_URL ?? "").trim().replace(/\/+$/, "");

export const INDEXER_URL = /^https?:\/\//.test(RAW) ? RAW : "";

export const INDEXER_ENABLED = INDEXER_URL !== "";
