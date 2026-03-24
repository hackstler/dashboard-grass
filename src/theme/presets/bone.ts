import type { ThemeTokens } from "../tokens";

export const bone: ThemeTokens = {
  // Surfaces — clean warm white (bone, not parchment)
  bg: "#f5f3f0",
  surface: "#ffffff",
  surfaceHi: "#eceae6",
  surfaceHover: "#e8e5e1",
  surfaceRaised: "#f9f8f6",
  border: "#ddd9d4",
  borderHi: "#c8c4be",

  // Text — deep warm charcoal
  text: "#3e3b36",
  textBright: "#1a1816",
  textMuted: "#6a665e",
  textDim: "#958f84",

  // Brand Triad — deeper for contrast on light bg
  accent: "#1d4ed8",
  accentHover: "#1e40af",
  accentMuted: "#1e3a8a",
  accentDim: "rgba(29, 78, 216, 0.08)",
  brand: "#6d28d9",
  brandDim: "rgba(109, 40, 217, 0.06)",
  brandAccent: "#be185d",

  // Status — deep for legibility
  green: "#15803d",
  greenMuted: "rgba(21, 128, 61, 0.10)",
  yellow: "#a16207",
  yellowMuted: "rgba(161, 98, 7, 0.10)",
  red: "#b91c1c",
  redMuted: "rgba(185, 28, 28, 0.08)",

  // Glass — clean
  glass: "rgba(255, 255, 255, 0.85)",
  glassSubtle: "rgba(255, 255, 255, 0.65)",

  // Shimmer
  shimmer: "rgba(0, 0, 0, 0.04)",

  // Shadows — soft
  shadowCard: "0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)",
  shadowCardHover: "0 0 0 1px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.10), 0 0 48px var(--card-glow, rgba(29,78,216,0.04))",
  shadowGlowAccent: "0 0 24px rgba(29,78,216,0.20), 0 0 56px rgba(29,78,216,0.06)",
  shadowGlowGreen: "0 0 24px rgba(21,128,61,0.16), 0 0 56px rgba(21,128,61,0.04)",
  shadowToastSuccess: "0 0 20px rgba(21, 128, 61, 0.12), 0 0 40px rgba(21, 128, 61, 0.04)",
  shadowToastError: "0 0 20px rgba(185, 28, 28, 0.12), 0 0 40px rgba(185, 28, 28, 0.04)",
  shadowToastInfo: "0 0 20px rgba(29, 78, 216, 0.12), 0 0 40px rgba(29, 78, 216, 0.04)",
  shadowNavActive: "inset 0 0 0 1px rgba(29, 78, 216, 0.15), 0 0 16px rgba(29, 78, 216, 0.08)",

  // Radii
  radiusSm: "0.375rem",
  radiusMd: "0.5rem",
  radiusLg: "0.75rem",
  radiusXl: "1rem",

  // Fonts
  fontMono: "'JetBrains Mono', 'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
};
