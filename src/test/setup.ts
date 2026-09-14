import "@testing-library/jest-dom";
import { randomUUID } from "node:crypto";

// jsdom 20 ships window.crypto without randomUUID; the app relies on it.
if (globalThis.crypto && typeof globalThis.crypto.randomUUID !== "function") {
  (globalThis.crypto as Crypto).randomUUID = randomUUID as Crypto["randomUUID"];
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
