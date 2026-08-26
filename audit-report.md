# South City Hospital — Frontend Audit Report
Date: 2026-08-25
Pages audited: Home, About, Departments, Doctors, Facilities, Testimonials, FAQ, Contact

## Executive Summary
- Overall score: **84/100** (Average of category scores)
- **Top 3 strengths**:
  1. Exceptionally well-structured design token system using Tailwind v4 `@theme` and CSS custom properties for a cohesive visual language.
  2. Thoughtful use of modern UI patterns (framer-motion for smooth page transitions, responsive mobile drawer, micro-interactions).
  3. Good abstraction of static hospital data (`src/data/hospital.ts`) to maintain consistency across the site.
- **Top 5 critical issues**:
  1. **[Critical]** Placeholder data in `doctors.mock.ts` ("Dr. Sample One") that will ship to production if the Supabase integration isn't completed.
  2. **[High]** Missing `.skip-link` HTML element for keyboard users, despite the CSS class existing in `globals.css`.
  3. **[High]** Lack of `MedicalOrganization` / `Hospital` structured JSON-LD schema for local SEO.
  4. **[Medium]** Duplicated emergency phone formatting logic (`split`, `replace`) scattered between `Navbar.tsx` and `Footer.tsx`.
  5. **[Low]** Potential color contrast failure if `--ink-300` (#D0D5DD) or `--accent` (#2DD4BF) is used against white backgrounds without a dark container.
- **Verdict**: The site is **not yet production-ready**, but the foundation is excellent. The architecture is sound, but it requires the actual Supabase database integration to replace placeholder doctor data, the addition of critical accessibility elements (skip links), and local SEO structured data before it can be trusted by real patients.

---

## Category Scores
| Category | Score /10 | Key Issue |
|---|---|---|
| 1. Visual Design & Brand Consistency | 9.5 | Minor inconsistencies in inline gradient usage vs tokens. |
| 2. UX & Information Architecture | 8.0 | Placeholder mock data for doctors. |
| 3. Accessibility (WCAG 2.1 AA) | 7.5 | Missing HTML for the skip-link; potential focus trap edge cases. |
| 4. Performance | 9.0 | Dynamic imports used correctly for mocks, but no real CWV data yet. |
| 5. Responsive & Cross-Device | 9.0 | Well-handled breakpoints, mobile drawer is smooth. |
| 6. Code Quality & Maintainability | 8.5 | Logic duplication for emergency number formatting. |
| 7. SEO & Metadata | 7.0 | Missing JSON-LD Schema.org structured data. |
| 8. Trust, Conversion & UX | 8.0 | Placeholder doctors heavily erode trust if seen by real users. |
| 9. Browser/Technical Correctness | 9.5 | Clean console, no validation errors, strong framework usage. |

---

## Detailed Findings

### 1. Visual Design & Brand Consistency — Score: 9.5/10
- **Evidence**: `globals.css` defines a strict token system (`--blue-950` to `--blue-50`, `--teal-400`, `--coral-600`) and aliases them semantically (`--primary`, `--emergency`). Typography scale (`--text-display-2xl` to `--text-xs`) is rigorously defined.
- **Issues found**:
  - [Low] (Navbar/Footer/CtaBand) Inline styles are sometimes used for gradients (e.g., `style={{ background: "linear-gradient(...)" }}`) rather than abstracting them into CSS classes like `.bg-hero-gradient`.
- **Why this score**: The design system is incredibly mature for a standard hospital site, utilizing modern typography (Playfair Display + Inter) and consistent shadows (`--shadow-card`). It misses a perfect score only due to occasional inline styles bypassing the utility system.

### 2. UX & Information Architecture — Score: 8.0/10
- **Evidence**: Navigation is clear, with active states handled elegantly via a framer-motion `layoutId="nav-underline"` in `Navbar.tsx`.
- **Issues found**:
  - [Critical] (`src/mocks/doctors.mock.ts`) "Dr. Sample One", "Dr. Sample Two". If the backend fails or isn't integrated, users see fake doctors.
- **Why this score**: The routing and layout are highly logical for a patient, but the presence of mock data in the critical path drops the score.

### 3. Accessibility (WCAG 2.1 AA) — Score: 7.5/10
- **Evidence**: Focus rings are globally defined (`*:focus-visible`), and `prefers-reduced-motion` is implemented in `globals.css`.
- **Issues found**:
  - [High] (`globals.css` / `layout.tsx`) The `.skip-link` class exists in CSS (lines 148-164), but the actual `<a href="#main" className="skip-link">Skip to content</a>` is completely missing from the HTML structure in `RootLayout`.
  - [Medium] (Global) Relying on standard Tailwind contrast, but `--accent` (#2DD4BF) against white fails AA contrast (1.6:1). It is currently safely used against dark blues, but there are no linting guards against using it on white.
- **Why this score**: The intent for accessibility is clearly in the CSS, but execution is missing the most fundamental requirement for keyboard users (the skip link).

### 4. Performance — Score: 9.0/10
- **Evidence**: `src/services/doctors.ts` dynamically imports mock data (`await import("@/mocks/doctors.mock")`), ensuring it doesn't bloat the main bundle. Next.js App Router and Turbopack are utilized for fast hydration.
- **Issues found**:
  - [Low] The site has not yet been deployed to a production environment to capture real Core Web Vitals (LCP, CLS, INP).
- **Why this score**: Excellent technical foundation using Next.js 15 features, but lacks real-world telemetry to confirm a 10/10.

### 5. Responsive & Cross-Device Behavior — Score: 9.0/10
- **Evidence**: Breakpoints are defined from `--breakpoint-xs` (480px) to `--breakpoint-2xl` (1536px). `Navbar.tsx` implements a sophisticated mobile drawer with a `FocusTrap` and `overflow: hidden` on the body.
- **Issues found**:
  - [Low] (Navbar.tsx) The `focus` logic in the mobile menu (lines 45-76) manually queries `a, button, [tabindex]`. This is brittle and could miss newer interactive elements or shadow DOM components if added later.
- **Why this score**: Visually, the site responds beautifully. The manual focus trap is the only technical risk.

### 6. Code Quality & Maintainability — Score: 8.5/10
- **Evidence**: Strong separation of concerns. Static data is isolated in `src/data/hospital.ts`. 
- **Issues found**:
  - [Medium] (`Navbar.tsx` line 100, `Footer.tsx` line 44) The string manipulation logic to format the emergency phone number (`replace(/\s/g, "")`, `split(' ')`) is duplicated across multiple components. This should be a utility function (e.g., `formatPhoneNumber(hospital.contact.emergency)`).
- **Why this score**: The codebase is modern and clean, but suffers from minor DRY (Don't Repeat Yourself) violations for formatting logic.

### 7. SEO & Metadata — Score: 7.0/10
- **Evidence**: `layout.tsx` contains solid baseline metadata (Title template, description, OpenGraph, Twitter cards, keywords).
- **Issues found**:
  - [High] (`layout.tsx`) Missing structured JSON-LD data. A hospital website *must* have `MedicalOrganization` or `Hospital` schema to rank properly in local SEO and map packs.
- **Why this score**: Good basic metadata, but missing the critical structured data required for healthcare SEO.

### 8. Trust, Conversion & Healthcare-Specific UX — Score: 8.0/10
- **Evidence**: The prominent, red `--emergency` banner is sticky and visible on all pages. "Book Appointment" CTAs are highly visible.
- **Issues found**:
  - [Critical] As mentioned, placeholder doctors erode trust immediately.
- **Why this score**: The UI patterns for trust (emergency banners, clean aesthetics, clear CTAs) are perfect, but the actual content data undermines it until Supabase is connected.

### 9. Browser/Technical Correctness — Score: 9.5/10
- **Evidence**: Next.js App Router enforces strict React paradigms. No console errors observed during local dev server execution.
- **Issues found**: None significant.
- **Why this score**: Solid, error-free execution on modern web standards.

---

## Page-by-Page Notes

- **Home**: Excellent hero transition and stats count-up.
- **About**: Clean layout, uses the `hospital.about` data effectively.
- **Departments**: Accordion interactions are smooth. 
- **Doctors**: Awaiting real data. The filtering tabs (using Framer Motion `layoutId`) are excellent.
- **Facilities**: Grid layout is responsive and clean.
- **Testimonials**: Masonry layout works well, but ensure quotes are from verified patients.
- **FAQ**: Animated accordions are highly usable.
- **Contact**: Form needs actual submission handling (e.g., to an API route or Supabase Edge Function).

---

## Issue Backlog

| # | Issue | Severity | Category | Page(s) | Suggested Fix |
|---|---|---|---|---|---|
| 1 | Placeholder doctor data | Critical | UX / Trust | `/doctors` | Complete Supabase integration in `services/doctors.ts`. |
| 2 | Missing HTML `.skip-link` | High | Accessibility | Global | Add `<a href="#main" className="skip-link">Skip to main content</a>` to `layout.tsx`. |
| 3 | Missing JSON-LD Schema | High | SEO | Global | Inject `<script type="application/ld+json">` with `Hospital` schema in `layout.tsx`. |
| 4 | Duplicated phone formatting | Medium | Code Quality | Nav, Footer | Extract a `formatPhone()` utility in `src/lib/utils.ts`. |
| 5 | Manual focus trap logic | Low | Responsive | Nav (Mobile) | Use a headless UI library (Radix) or a robust hook for the mobile menu focus trap. |

---

## Appendix

### Color Palette (from `globals.css`)
- `--blue-950`: `#071B3D`
- `--blue-800`: `#0F2E5C` (Primary Dark)
- `--blue-600`: `#1B4F9C` (Primary)
- `--blue-500`: `#2E6BD1` (Primary Mid)
- `--blue-100`: `#E7EFFC` (Primary Light)
- `--blue-50`: `#F5F9FF` (Cloud)
- `--teal-400`: `#2DD4BF` (Accent)
- `--coral-600`: `#E24C4B` (Emergency)
- `--amber-400`: `#F5A623`
- `--ink-900`: `#101828` (Ink / Text)
- `--ink-600`: `#475467` (Slate / Secondary Text)
- `--ink-300`: `#D0D5DD` (Mist / Borders)

### Typography Scale
- `--font-display`: Playfair Display
- `--font-sans`: Inter
- `--font-mono`: IBM Plex Mono
- `--text-display-2xl` to `--text-display-sm` (Fluid clamp values)
- `--text-xl` (1.25rem) down to `--text-xs` (0.75rem)

### Placeholder Content Identified
- `Dr. Sample One` (Cardiology)
- `Dr. Sample Two` (Internal Medicine)
- `Dr. Sample Three` (Neurosurgery)
