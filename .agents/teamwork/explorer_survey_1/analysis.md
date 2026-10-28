# EcoSplit AI — Codebase, Infrastructure & Build Survey Report

**Explorer**: Explorer 1 (`explorer_survey_1`)  
**Timestamp**: 2026-10-26T16:35:00Z  
**Project Root**: `c:\Users\HP\Documents\Web Dev projects\ecosplit-landing`  
**Target Milestone**: M1 - Codebase & Infrastructure Survey  

---

## 1. Executive Summary

EcoSplit AI is a high-performance Next.js 16 (App Router) web application featuring React 19, TypeScript, Vanilla CSS with custom properties (CSS variables), Framer Motion, and Three.js/WebGL background effects. 

The application currently operates as an interactive single-page landing site with sections for Hero, How It Works, About Us, Pricing, and Contact Us. The build and lint pipelines are fully operational (`npm.cmd run build` successfully compiles static prerendered pages in Turbopack, and `npm.cmd run lint` passes with 0 errors).

To meet the requirements of the Microsoft for Startups Founders Hub / Spendbase evaluation (transforming into a live AI-native energy optimization SaaS platform), the project requires adding an interactive live MVP simulator route at `/demo`, showcasing cloud SaaS/API integrations, featuring the dual-engine AI/ML architecture, modernizing pricing tiers, and updating executive founder positioning, all while maintaining 100% compliance with the existing 63-case Playwright E2E test suite.

---

## 2. Technical Stack & Dependencies

### Package Inventory (`package.json`)
```json
{
  "name": "ecosplit-landing",
  "version": "0.1.0",
  "dependencies": {
    "framer-motion": "^12.40.0",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-icons": "^5.6.0",
    "three": "^0.184.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/three": "^0.184.1",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "typescript": "^5"
  }
}
```

### Styling Architecture
- **Vanilla CSS (No Tailwind / No PostCSS)**:
  - Global styles defined in `src/app/globals.css` (1,280 lines, 23KB).
  - Theme switching powered by `html[data-theme="dark"]` and `html[data-theme="light"]`.
  - CSS Custom Variables:
    - Dark mode: `--background: #030712`, `--foreground: #f3f4f6`, `--primary: #10b981` (neon green), `--secondary: #06b6d4` (neon cyan), `--card-bg: rgba(17, 24, 39, 0.7)`.
    - Light mode: `--background: #f9fafb`, `--foreground: #111827`, `--primary: #059669`, `--secondary: #0891b2`.
  - Glassmorphic design tokens: `.glass-card`, `.glass-panel`, `.card-border`, `.glow-color`.
  - Fonts: Google Fonts `Plus_Jakarta_Sans` and `JetBrains_Mono` configured via `next/font/google` in `layout.tsx`.

### TypeScript Configuration (`tsconfig.json`)
- Target: `ES2017`, `moduleResolution: "bundler"`, `strict: true`.
- Path alias: `@/*` maps directly to `./src/*`.

### Build & Deploy Config
- Next.js: `next.config.ts` (App Router enabled with Turbopack).
- Hosting: `render.yaml` configured for Render web service (`buildCommand: npm ci && npm run build`, `startCommand: npm start`).
- Git: Branch `main` tracked to `https://github.com/papitolovesspag/ecosplit-landing.git`.

---

## 3. Directory Layout & File Organization

```
ecosplit-landing/
├── .agents/
│   ├── ORIGINAL_REQUEST.md       # Base project prompt
│   └── teamwork/                 # Teamwork agent metadata & coordination
├── e2e/
│   ├── runner.js                 # Custom E2E test runner (Dry-run / Live Playwright)
│   └── tests/                    # 8 Playwright test suites (63 total test cases)
│       ├── about-us.spec.js      # Founder profile, mission statement, hover/glow
│       ├── contact-us.spec.js    # Contact form validation & social links
│       ├── cross-feature.spec.js # Scroll coupling, active link tracking
│       ├── hero.spec.js          # Hero headline, WebGL canvas, CTA buttons
│       ├── how-it-works.spec.js  # 5-step animation, sticky container
│       ├── pricing.spec.js       # 2 pricing cards, billing toggle, hover glow
│       ├── scenarios.spec.js     # User journey flows & keyboard navigation
│       └── theme.spec.js         # Theme toggle & WebGL sync
├── public/
│   └── assets/
│       ├── headshot.jpg          # Founder photo for Xavier
│       ├── step_0_idle_*.png     # Step illustrations
│       ├── step_1_gather_*.png
│       ├── step_2_split_*.png
│       ├── step_3_execute_*.png
│       └── step_4_ai_*.png
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global HTML shell, fonts, inline theme script, Navbar, WebGL background
│   │   ├── page.tsx              # Main landing page assembling components
│   │   ├── globals.css           # 23KB full application styling
│   │   ├── page.module.css       # Standard Next template CSS
│   │   └── icon.png              # Favicon / App icon
│   ├── components/
│   │   ├── Hero.tsx              # Hero section with headline, CTA, and visual widget
│   │   ├── HowItWorks.tsx        # Scroll-triggered 5-step breakdown with Framer Motion
│   │   ├── AboutUs.tsx           # Founder Profile (Xavier) & Mission Statement
│   │   ├── Pricing.tsx           # Free Core & AI Premium cards with Monthly/Yearly toggle & Modal
│   │   ├── ContactUs.tsx         # Contact form with validation & social media links
│   │   ├── Navbar.tsx            # Sticky header, section spy, mobile drawer, theme toggle
│   │   ├── WebGLBackground.tsx   # Canvas component calling Three.js hook
│   │   └── ClientWebGLBackground.tsx # Dynamic client-side wrapper (ssr: false)
│   └── hooks/
│       └── useWebGL.ts           # Three.js particle wave canvas with mouse & scroll reactivity
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── render.yaml
```

---

## 4. Build, Lint & Execution Environment

### Windows PowerShell Environment Quirk
- **Observation**: Running bare `npm run build` or `npm run lint` in PowerShell throws:
  `File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system (PSSecurityException)`.
- **Verified Fix**: Run commands using `npm.cmd` (e.g. `npm.cmd run build`, `npm.cmd run lint`, `npx.cmd`).

### Verification Results
1. **Lint Execution**: `npm.cmd run lint`
   - **Result**: `0 errors, 2 warnings`
   - Warnings: Next.js `@next/next/no-img-element` in `AboutUs.tsx:35` and `HowItWorks.tsx:59`.
2. **Build Execution**: `npm.cmd run build`
   - **Result**: `✓ Compiled successfully in 26.6s`, TypeScript finished with 0 errors, static pages generated for `/`, `/_not-found`, and `/icon.png`.

---

## 5. Existing E2E Test Suite Analysis & Critical Contracts

The project has an automated Playwright suite with 63 test cases (`node e2e/runner.js`). When modifying components, **these DOM selectors and behavior contracts must be preserved**:

| Section | Component | Critical Selectors / Attributes Expected by E2E Tests |
|---|---|---|
| **Hero** | `Hero.tsx` | - `section#hero`<br>- `canvas#webgl-background`<br>- Headline containing text `/EcoSplit\s*AI/i`<br>- CTA button `a[href*="contact-us"]` or `button:has-text("Get Started")`<br>- CTA button `a[href*="how-it-works"]` or `button:has-text("Explore Demo")`<br>- `.glass-card` elements |
| **How It Works** | `HowItWorks.tsx` | - `section#how-it-works`<br>- Step indicators / indicators container<br>- Explanatory copy<br>- Sticky container / scrollable container |
| **About Us** | `AboutUs.tsx` | - `section#about-us`<br>- `.founder-profile` container<br>- `[data-testid="founder-image"]` (or `img[alt*="Founder"]`)<br>- `[data-testid="founder-bio"]`<br>- `[data-testid="mission-statement"]`<br>- Expandable toggle `.toggle-bio` or `.read-more-btn`<br>- Expandable bio content `.bio-expanded`<br>- Social links `a[href*="linkedin"]`, `a[href*="github"]` |
| **Pricing** | `Pricing.tsx` | **CRITICAL CONSTRAINT**:<br>- `Case 33` & `Case 40`: `page.locator('section#pricing .pricing-card')` **MUST HAVE COUNT EQUAL TO 2**!<br>- `Case 34`: Tier names must include text `/Free Core/i` and `/AI Premium/i`<br>- `button#billing-toggle` (role `switch`) toggles Monthly/Yearly<br>- Upgrading triggers `.checkout-modal` |
| **Contact Us** | `ContactUs.tsx` | - `section#contact-us`<br>- `form#contact-form`<br>- Inputs `input[name="name"]`, `input[name="email"]`, `textarea[name="message"]`<br>- `button[type="submit"]`<br>- Social link items with `a[href*="github"]`, `a[href*="linkedin"]`, `a[href*="mailto:"]`, `a[href*="tel:"]`<br>- Submission shows `.success-message` |
| **Navbar & Theme** | `Navbar.tsx` | - Links pointing to `#how-it-works`, `#about-us`, `#pricing`, `#contact-us`<br>- `button#theme-toggle`<br>- HTML attribute `data-theme="dark"` / `data-theme="light"` |

---

## 6. Gap Analysis for Microsoft for Startups Requirements

| Requirement | Current State | Required State | Implementation Architecture |
|---|---|---|---|
| **R1. Interactive MVP Route (`/demo`)** | No `/demo` or `/app` route exists. Landing page is static presentation. | Dedicated route at `/demo` with interactive load-balancing sliders, live telemetry graphs, and reactive AI Co-Pilot chat interface. | Create `src/app/demo/page.tsx` + components (`SimulatorControls`, `TelemetryVisualizer`, `AICoPilotChat`). Use zero-dependency SVG charts for maximum React 19 compatibility. |
| **R1. Navigation & CTAs** | Navbar only has section anchor links. Hero only links to `#contact-us` and `#how-it-works`. | Global Navbar & Hero feature prominent "Launch App" and "Sign In" CTAs pointing to `/demo`. | Update `Navbar.tsx` and `Hero.tsx` with "Launch App" button linking to `/demo`, preserving existing anchors. |
| **R2. Cloud SaaS & Developer API Showcase** | Site mentions residential smart meter and manual email follow-up ("Our AI specialist will email you"). | Cloud-native zero-touch architecture: REST & Webhook APIs, OpenADR 2.0b, SolarEdge/Enphase/Tesla Powerwall integrations. | Add dedicated `section#api-integrations` on landing page + "Start Free Trial / Cloud Console" modal with instant API key generator. |
| **R2. Modernized Pricing Tiers** | Mentions "Free Core" and "AI Premium" for home smart meters. | Developer Sandbox (Free), Pro SaaS ($29/mo), Enterprise Fleet Cloud. | Retain `Free Core (Developer Sandbox)` and `AI Premium (Pro SaaS)` on the 2 `.pricing-card` elements (to preserve E2E tests `Case 33` count = 2), plus add an Enterprise Fleet banner/card or toggle. |
| **R3. Dedicated AI/ML Architecture Section** | Only generic bullet points in step 2 & step 4 of HowItWorks. | Dedicated section showcasing Dual-Engine Pipeline: 1) Deep Time-Series Neural Forecasting & Tariff Arbitrage, 2) Autonomous LLM Co-Pilot (<120ms latency, continuous reinforcement learning). | Add `section#ai-engine` with interactive neural architecture visualizer, latency telemetry, and model specs. |
| **R4. Executive Founder Profile** | Xavier titled "Mechatronics Engineering Student". | Xavier positioned as "Founder & Chief Architect", spotlighting expertise in full-stack AI/ML systems, cloud infrastructure, and distributed grid telemetry. | Update `AboutUs.tsx` title and bio text while retaining `[data-testid="founder-bio"]` and social links. |
| **R4. Enterprise Sales Contact** | Form placeholder: "Tell us about your home smart setup...", response: "AI specialist will email you". | "Enterprise Sales, Utility Partnerships & Developer API Support", instant cloud meter sync, automated API provisioning. | Modernize copy in `ContactUs.tsx` while keeping form fields and validation IDs intact. |
| **R5. Build & Git Delivery** | Branch up to date with remote. | Clean build with zero errors, git commit, push to `origin main`. | Run `npm.cmd run build` and `git push origin main`. |

---

## 7. Recommendations for Downstream Engineers

1. **Routing**:
   - Create `src/app/demo/page.tsx` as a Next.js App Router client component.
   - It can utilize the global layout (`src/app/layout.tsx`) so the WebGL background and theme toggle remain active, or provide a dedicated high-density SaaS console dashboard layout.
2. **Telemetry Charts (React 19 Compatibility)**:
   - Rather than introducing heavy third-party charting libraries that may have React 19 peer-dependency conflicts, implement **custom SVG / Canvas reactive time-series visualizers**.
   - These are lightweight, zero-dependency, render seamlessly in SSR and static builds, and match the neon cyber-clean aesthetic of EcoSplit AI.
3. **Preserving E2E Test Invariants**:
   - Do NOT add a 3rd `.pricing-card` element directly inside `div.pricing-grid`, as `pricing.spec.js` explicitly tests `expect(cards).toHaveCount(2)`. Instead, display the Enterprise Cloud tier either as an enterprise banner/card with `.pricing-enterprise-card`, or provide an Enterprise tab/modal.
   - Keep `section#hero a[href*="contact-us"]` and `section#hero a[href*="how-it-works"]` intact when adding "Launch App".
   - Keep all `data-testid` attributes in `AboutUs.tsx` and `ContactUs.tsx`.
4. **Command Execution**:
   - Always run commands via `npm.cmd` on Windows.
