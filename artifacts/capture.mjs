/**
 * Capture the evidence-pack screenshots from the running app.
 *
 *   npm run build
 *   npm run preview            # serves on :4173
 *   node artifacts/capture.mjs # needs: google-chrome --remote-debugging-port
 *
 * Uses the Chrome DevTools Protocol directly rather than a browser-automation
 * dependency, so it adds nothing to package.json.
 *
 * Why CDP rather than `chrome --headless --screenshot --window-size=W,H`:
 * --window-size sets the OS window, not the CSS viewport, so the page lays out
 * wider than the image and the capture silently CROPS the right edge — which
 * looks exactly like a responsive bug and is not one. Emulation
 * .setDeviceMetricsOverride sets the real viewport, and lets us assert
 * scrollWidth === clientWidth before every capture.
 *
 * Usage:
 *   (google-chrome --headless --disable-gpu --no-sandbox \
 *      --remote-debugging-port=9224 about:blank &)
 *   node artifacts/capture.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "screenshots");
const PORT = process.env.CDP_PORT ?? "9224";
const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 5500);

const ROUTES = [
  ["landing", "/"],
  ["demo", "/demo"],
  ["commitments", "/commitments"],
  ["commitment-1", "/commitments/1"],
  ["rounds", "/commitments/1/rounds"],
  ["register", "/commitments/new"],
  ["how-it-works", "/how-it-works"],
  ["fairness", "/fairness"],
];

const VIEWS = [
  ["desktop", 1280, 900],
  ["mobile-360", 360, 780],
];

const MAX_SHOT_HEIGHT = 14000;

mkdirSync(OUT, { recursive: true });

const target = await (
  await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: "PUT" })
).json();

const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};

await new Promise((resolve) => {
  ws.onopen = resolve;
});

await send("Page.enable");

let overflows = 0;

for (const [viewName, width, height] of VIEWS) {
  for (const [name, route] of ROUTES) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    await send("Page.navigate", { url: `${BASE}${route}` });
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

    const probe = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `JSON.stringify({
        cw: document.documentElement.clientWidth,
        sw: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight
      })`,
    });
    const { cw, sw, h } = JSON.parse(probe.result.value);

    // UI-CivicLens section 10: "the page body never scrolls sideways".
    const overflow = sw > cw;
    if (overflow) overflows += 1;

    const clipHeight = Math.min(h, MAX_SHOT_HEIGHT);
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: cw, height: clipHeight, scale: 1 },
    });
    writeFileSync(join(OUT, `${viewName}-${name}.png`), Buffer.from(shot.data, "base64"));

    console.log(
      `${viewName.padEnd(11)} ${route.padEnd(22)} cw=${cw} sw=${sw} ` +
        `${overflow ? "!! HORIZONTAL OVERFLOW" : "ok"}  ${clipHeight}px`,
    );
  }
}

ws.close();

if (overflows > 0) {
  console.error(`\n${overflows} route(s) scroll horizontally — this violates UI-CivicLens 10.`);
  process.exit(1);
}
console.log("\nAll routes captured with no horizontal overflow.");