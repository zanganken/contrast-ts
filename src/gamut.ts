"use strict";

export function detectColorGamut() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "rgb"; // default fallback for SSR or unsupported environments
  }

  if (window.matchMedia("(color-gamut: rec2020)").matches) {
    return "rec2020";
  }

  if (window.matchMedia("(color-gamut: p3)").matches) {
    return "p3";
  }

  return "rgb";
}
