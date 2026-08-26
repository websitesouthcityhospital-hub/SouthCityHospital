/**
 * South City Hospital — Design Tokens
 * Single source of truth for all design values.
 * Used in Framer Motion and any JS context.
 * CSS equivalents live in globals.css as custom properties.
 */

// ─── COLOR PALETTE ──────────────────────────────────────────────────────────
export const colors = {
  // Blue primary scale
  primary: "#1A4F8A",         // Main brand blue — CTAs, active states, focus rings
  primaryDark: "#0F3566",     // Deepened blue — hero text, hover states
  primaryLight: "#EFF4FB",    // Tint — card fills, hover backgrounds
  primaryMid: "#2E6DB4",      // Mid blue — secondary actions, tags
  accent: "#2BBDC4",          // Teal-blue accent — pulse line, stat highlights
  accentLight: "#E8F8F9",     // Accent tint — accent card fills

  // Neutrals
  ink: "#0D1B2A",             // Near-black — primary body text
  slate: "#3A4F65",           // Mid-dark — secondary text, labels
  mist: "#D8E4EF",            // Light blue-grey — borders, dividers
  cloud: "#F0F5FB",           // Off-white blue — page background, section fills
  white: "#FFFFFF",           // Pure white

  // Semantic
  emergency: "#C1312B",       // Signal Red — emergency bar ONLY
  emergencyLight: "#FEF2F2",  // Emergency tint
  success: "#1A7C54",         // Success states
  warning: "#B45309",         // Warning states

  // Category accents for facility/department tags
  diagnostic: "#1A4F8A",      // Primary blue
  criticalCare: "#C1312B",    // Emergency red
  outpatient: "#1A7C54",      // Success green
} as const;

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
export const fontFamily = {
  // SLOT: Revenue typeface — to be replaced with next/font/local when files supplied by Bakhtiar
  display: "'Playfair Display', 'Georgia', serif",
  sans: "'Inter', 'system-ui', sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
} as const;

// Type scale (rem)
export const fontSize = {
  display2xl: "4.5rem",   // 72px — Hero headline
  displayXl: "3.75rem",  // 60px — Page titles
  displayLg: "3rem",     // 48px — Section headings
  displayMd: "2.25rem",  // 36px — Sub-section headings
  displaySm: "1.875rem", // 30px — Card headings, H3
  xl: "1.25rem",         // 20px — Lead text, large labels
  lg: "1.125rem",        // 18px — Body large
  base: "1rem",          // 16px — Body
  sm: "0.875rem",        // 14px — Small labels, captions
  xs: "0.75rem",         // 12px — Tags, badges
} as const;

// ─── SPACING ─────────────────────────────────────────────────────────────────
export const spacing = {
  sectionY: "5rem",        // 80px — Between major page sections
  sectionYMd: "6.25rem",  // 100px — Larger section spacing at desktop
  containerPx: "1.25rem", // 20px — Container padding mobile
  containerPxMd: "2rem",  // 32px — Container padding tablet+
  containerPxLg: "4rem",  // 64px — Container padding desktop
  cardPad: "1.5rem",      // 24px — Card inner padding
  cardPadLg: "2rem",      // 32px — Large card inner padding
} as const;

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────
export const radius = {
  card: "12px",
  button: "8px",
  tag: "6px",
  full: "9999px",
} as const;

// ─── SHADOWS (tinted with primary blue, not black) ───────────────────────────
export const shadows = {
  card: "0 1px 3px rgba(26,79,138,0.07), 0 1px 2px rgba(26,79,138,0.05)",
  hover: "0 4px 16px rgba(26,79,138,0.12), 0 2px 4px rgba(26,79,138,0.07)",
  overlay: "0 20px 48px rgba(26,79,138,0.18), 0 8px 16px rgba(26,79,138,0.10)",
  emergency: "0 2px 8px rgba(193,49,43,0.20)",
} as const;

// ─── ANIMATION ───────────────────────────────────────────────────────────────
export const durations = {
  fast: 0.15,     // 150ms — Micro-interactions, hover
  base: 0.25,     // 250ms — Standard transitions
  slow: 0.4,      // 400ms — Modal opens, page sections
  hero: 1.0,      // 1000ms — Hero entrance
  stagger: 0.08,  // 80ms — Stagger delay between children
} as const;

export const easings = {
  standard: [0.4, 0, 0.2, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
} as const;

// ─── ICON SIZES ──────────────────────────────────────────────────────────────
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

// ─── BREAKPOINTS ─────────────────────────────────────────────────────────────
export const breakpoints = {
  sm: "480px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;
