# Project: EcoSplit AI Platform Revamp

## Executive Overview
Revamp the EcoSplit AI platform to decisively satisfy Microsoft for Startups Founders Hub / Spendbase criteria (MVP stage or beyond, scalable cloud software model, and natively integrated AI/ML), transforming it from an ideation/service-style page into a live AI-native energy optimization SaaS platform.

## Architecture
- **Framework**: Next.js 16.2.9 (App Router) + React 19.2.4 + TypeScript 5
- **Styling**: Vanilla CSS with custom properties in `src/app/globals.css` (Glassmorphic dark/light neon theme)
- **Visuals**: Three.js WebGL particle background (`src/hooks/useWebGL.ts`) + Framer Motion animations
- **Routing**:
  - Landing Page: `/` (`src/app/page.tsx`)
  - Live MVP Simulator Portal: `/demo` (`src/app/demo/page.tsx`, with `/app` redirect)
- **E2E Testing**: Playwright runner (`e2e/runner.js`) with 63 automated test cases covering Hero, HowItWorks, AboutUs, Pricing, ContactUs, Theme, Scenarios, and Cross-feature workflows.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Live Interactive MVP Simulator Route (`/demo`) | Dedicated Next.js App Router interactive portal delivering real-time energy load splitting | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Interactive Load-Balancing Controls | Sliders/toggles for energy load (kW), peak shaving threshold (kW), grid tariff multiplier ($/kWh), and battery split (%) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Real-Time Telemetry Visualizer | Reactive calculation engine & SVG/Canvas visualizers showing baseline vs split kW, grid load, cost reduction (up to 45%), and carbon offset | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Interactive AI Co-Pilot Assistant | Chat interface with prompt pills ('Optimize for peak tariff', 'Diagnose load anomaly', 'Simulate grid outage', 'Forecast tomorrow peak') mutating parameters & providing AI reasoning | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Operational Preset Scenarios | 4 quick preset buttons (Peak Tariff Arbitrage, Green Grid Low Carbon, Critical Stress Peaker, EV Fleet Spike) | M1 | Explorer 3 Survey |
| 6 | Dedicated AI/ML Engine Section (`#architecture`) | Breakdown of dual-engine pipeline: Deep Time-Series Neural Forecasting & Tariff Arbitrage + Autonomous LLM Co-Pilot | M2 | ORIGINAL_REQUEST §R3 |
| 7 | Live Neural Performance Telemetry | Specs display: <118ms P99 inference latency, 98.4% day-ahead accuracy, continuous reinforcement learning | M2 | ORIGINAL_REQUEST §R3 |
| 8 | Dedicated API & Integrations Showcase (`#api-integrations`) | Code snippet tabs (cURL, TypeScript, Python) for `/v1/telemetry/split` and OpenADR 2.0b VEN compliance | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Pre-Built Hardware & Inverter Connectors | Connector cards for Enphase Enlighten, SolarEdge Cloud, Tesla Powerwall & Energy API, OpenADR 2.0b | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Global Navbar & Hero SaaS Entry Points | Prominent "Launch App" (links to `/demo`) and "Sign In" / "Launch Console" CTAs added to Navbar and Hero | M3 | ORIGINAL_REQUEST §R1 |
| 11 | SaaS Messaging Refactor | Replace 100% of manual setup, agency, or service consulting language with automated cloud-native onboarding | M3 | ORIGINAL_REQUEST §R2 |
| 12 | Revamped Modern SaaS Pricing Tiers | Developer Sandbox (Free Core $0), Pro SaaS (AI Premium $29/mo), and Enterprise Cloud banner preserving 2-card test selector invariant | M3 | ORIGINAL_REQUEST §R2, Explorer 1/2 |
| 13 | Interactive Launch Console / Free Trial Modal | Self-serve onboarding modal with hardware selection, instant API token generation, and `/demo` jump link | M3 | ORIGINAL_REQUEST §R2 |
| 14 | Executive Founder Profile Update | Reposition Xavier as "Founder & Chief Architect", spotlighting AI/ML systems, cloud infrastructure, and distributed grid telemetry | M3 | ORIGINAL_REQUEST §R4 |
| 15 | Enterprise Sales & Developer API Contact | Upgrade ContactUs to enterprise fleet inquiries, API support, and cloud meter sync credentials | M3 | ORIGINAL_REQUEST §R4 |
| 16 | Modern SaaS Footer & System Health | Global footer with developer resources, legal/security tokens, and live operational status indicator | M3 | Explorer 2 Survey |
| 17 | Zero-Error Compilation & Linting | Verify `npm.cmd run build` and `npm.cmd run lint` succeed with zero errors | M4 | ORIGINAL_REQUEST §R5 |
| 18 | E2E Test Suite Preservation | Ensure all 63 Playwright tests in `e2e/runner.js` continue passing with zero regressions | M4 | ORIGINAL_REQUEST §R5 |
| 19 | Git Delivery | Clean git commit with comprehensive description and push to `origin main` | M4 | ORIGINAL_REQUEST §R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Live Interactive MVP Simulator & AI Co-Pilot Portal | Route `src/app/demo/page.tsx`, simulation engine, reactive SVG telemetry, interactive AI Co-Pilot chat, scenario presets | none | DONE |
| M2 | AI/ML Engine & API Integrations Architecture Showcase | `src/components/Architecture.tsx`, `src/components/ApiShowcase.tsx`, interactive code tabs, hardware connectors, neural performance specs | none | DONE |
| M3 | Landing Page SaaS Revamp, Pricing, Founder & Enterprise Positioning | `Navbar.tsx`, `Hero.tsx`, `Pricing.tsx`, `AboutUs.tsx`, `ContactUs.tsx`, `HowItWorks.tsx`, `LaunchConsoleModal.tsx`, `Footer.tsx`, `page.tsx`, `globals.css` | M1, M2 | DONE |
| M4 | E2E Verification, Build Validation, Test Invariant Compliance & Git Push | `npm.cmd run build`, `npm.cmd run lint`, Playwright runner (63 tests passing 100%), clean git commit and push to `origin main` | M1, M2, M3 | DONE |

## Interface Contracts
### Main Landing Page ↔ Live MVP Simulator (`/demo`)
- Primary Entry: Navbar button `Launch App` -> `href="/demo"`
- Secondary Entry: Hero primary CTA `Launch App` -> `href="/demo"`
- Modal Entry: `LaunchConsoleModal` -> Button "Open Live Simulator Console" -> `router.push('/demo')`
- Return Entry: Header in `/demo` provides `← Return to Landing` linking back to `/`
- Theme Sync: `/demo` shares the root layout's `data-theme="dark"` / `data-theme="light"` CSS custom variables.

### Main Landing Page ↔ Launch Console Modal
- Triggered by "Sign In" button in Navbar and "Launch Console" in Hero and Pricing tiers.
- Focus trap and Escape key listener.
- Preserves checkout text for Pro tier: "You selected the AI Premium plan ($29/mo)" for test compatibility.

### E2E Test Invariant Contracts
- `section#pricing .pricing-card` count MUST remain exactly 2 (Free Core & AI Premium).
- `section#about-us` must retain `[data-testid="founder-bio"]`, `[data-testid="founder-image"]`, `[data-testid="mission-statement"]`, and `.toggle-bio`.
- `section#contact-us` must retain `form#contact-form`, all field names, and `.success-message`.
- `section#hero` must retain `a[href*="how-it-works"]` and `a[href*="contact-us"]`.

## Code Layout
- `src/app/demo/page.tsx`: Live Interactive MVP Portal (client component)
- `src/components/Architecture.tsx`: AI/ML Engine & Core Architecture section (`#architecture`)
- `src/components/ApiShowcase.tsx`: API & Integrations showcase (`#api-integrations`)
- `src/components/LaunchConsoleModal.tsx`: Interactive onboarding & API key generation modal
- `src/components/Footer.tsx`: Global SaaS footer with system health status
- `src/components/Navbar.tsx`: Updated header with Launch App, Sign In, and new navigation anchors
- `src/components/Hero.tsx`: Updated SaaS copy and Launch App CTAs
- `src/components/HowItWorks.tsx`: Updated cloud telemetry & neural forecasting step copy
- `src/components/Pricing.tsx`: Updated SaaS pricing tiers with Enterprise banner & modal
- `src/components/AboutUs.tsx`: Updated Founder & Chief Architect profile
- `src/components/ContactUs.tsx`: Updated Enterprise Sales & API support
- `src/app/page.tsx`: Page assembly in optimal narrative order
- `src/app/globals.css`: Supporting styles for new components & simulator
- `next.config.ts`: Added `/app` -> `/demo` redirect
