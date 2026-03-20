import type { ThemeTokens } from "../tokens";

export const bone: ThemeTokens = {
  // Surfaces — dark parchment (aged paper, not white)
  bg: "#cdc5b8",
  surface: "#d5cdc0",
  surfaceHi: "#c4bcb0",
  surfaceHover: "#bbb4a8",
  surfaceRaised: "#b2aaa0",
  border: "#a8a094",
  borderHi: "#989084",

  // Text — deep warm charcoal
  text: "#3e3b36",
  textBright: "#18160e",
  textMuted: "#6a665e",
  textDim: "#958f84",

  // Brand Triad — deeper for contrast on warm parchment
  accent: "#1d4ed8",
  accentHover: "#1e40af",
  accentMuted: "#1e3a8a",
  accentDim: "rgba(29, 78, 216, 0.12)",
  brand: "#6d28d9",
  brandDim: "rgba(109, 40, 217, 0.10)",
  brandAccent: "#be185d",

  // Status — deep for legibility
  green: "#15803d",
  greenMuted: "rgba(21, 128, 61, 0.14)",
  yellow: "#a16207",
  yellowMuted: "rgba(161, 98, 7, 0.14)",
  red: "#b91c1c",
  redMuted: "rgba(185, 28, 28, 0.12)",

  // Glass — warm tinted
  glass: "rgba(213, 205, 192, 0.90)",
  glassSubtle: "rgba(213, 205, 192, 0.70)",

  // Shimmer
  shimmer: "rgba(0, 0, 0, 0.05)",

  // Shadows — warm
  shadowCard: "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.08)",
  shadowCardHover: "0 0 0 1px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.12), 0 0 48px var(--card-glow, rgba(29,78,216,0.06))",
  shadowGlowAccent: "0 0 24px rgba(29,78,216,0.25), 0 0 56px rgba(29,78,216,0.08)",
  shadowGlowGreen: "0 0 24px rgba(21,128,61,0.20), 0 0 56px rgba(21,128,61,0.06)",
  shadowToastSuccess: "0 0 20px rgba(21, 128, 61, 0.15), 0 0 40px rgba(21, 128, 61, 0.05)",
  shadowToastError: "0 0 20px rgba(185, 28, 28, 0.15), 0 0 40px rgba(185, 28, 28, 0.05)",
  shadowToastInfo: "0 0 20px rgba(29, 78, 216, 0.15), 0 0 40px rgba(29, 78, 216, 0.05)",
  shadowNavActive: "inset 0 0 0 1px rgba(29, 78, 216, 0.20), 0 0 16px rgba(29, 78, 216, 0.10)",

  // Radii
  radiusSm: "0.375rem",
  radiusMd: "0.5rem",
  radiusLg: "0.75rem",
  radiusXl: "1rem",

  // Fonts
  fontMono: "'JetBrains Mono', 'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
};
