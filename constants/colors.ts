/**
 * TaniSync Neoclay Design Tokens
 * Sumber tunggal kebenaran warna sesuai design.md & rules.md
 */

export const Colors = {
  // Brand Core
  primary: "#3FA86B",
  secondary: "#1F5C3D",
  ink: "#123924", // Signature border & neobrutalist offset shadow color

  // Accent & Semantics
  amber: "#FFB627", // Gamifikasi, badge, streak
  coral: "#FF6B5C", // Alert, urgent, butuh siram
  teal: "#2E9E8C",  // Tag sosial & komunitas

  // Surfaces & Backgrounds
  neutral: "#FBF8F0",  // Background layar utama (Cream)
  surface: "#FFFFFF",  // Card flat, popup, input background
  container: "#F1EEE6",// Sekunder container

  // Text & Content
  onPrimary: "#FFFFFF",
  onNeutral: "#26251F",
  muted: "#5C5A4F",
  outline: "#E5E2DB",

  // Tints & Lights
  primaryLight: "#E8F5E9",
  coralLight: "#FFECEB",
  amberLight: "#FFF8E6",
  amberText: "#8A5A00",
  tealLight: "#E6F6F4",
} as const;

export default Colors;
