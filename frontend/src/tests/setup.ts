import "@testing-library/jest-dom/vitest";

/** jsdom does not implement clipboard; individual tests stub what they need. */
if (!navigator.clipboard) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: () => Promise.resolve() },
    configurable: true,
  });
}