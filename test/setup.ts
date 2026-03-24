import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/image globally
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, width, height, className, priority, onError }: {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    onError?: () => void;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { createElement } = require("react");
    return createElement("img", { src, alt, width, height, className, "data-fill": fill, "data-priority": priority, onError });
  },
}));

// Mock next/font/google globally
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans", className: "geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono", className: "geist-mono" }),
}));

// Polyfill crypto.randomUUID for jsdom
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2),
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    },
    configurable: true,
  });
}
