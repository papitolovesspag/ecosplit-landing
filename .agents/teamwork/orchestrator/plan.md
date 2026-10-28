# Project Plan: EcoSplit AI Platform Revamp

## Objectives
Transform EcoSplit AI into a live AI-native energy optimization SaaS platform satisfying Microsoft for Startups Founders Hub / Spendbase criteria.

## Milestones & Execution Stages
1. **Survey Stage (Phase 0)**:
   - Spawn 3 parallel Explorers:
     - Explorer 1: Inspect existing project structure, Next.js / React config, packages, styling (Tailwind/Lucide), routing, components, and current build status.
     - Explorer 2: Inspect existing landing page content, current messaging, CTAs, forms, pricing, and identify all areas requiring refactoring to cloud SaaS.
     - Explorer 3: Investigate simulator design, interactive telemetry state architecture, and AI Co-Pilot chat engine requirements for `/demo`.
   - Merge findings into `PROJECT.md` with Feature Inventory and Interface Contracts.

2. **Milestone 1: Live Interactive MVP Dashboard & Simulator Portal (R1)**:
   - Route `/demo` (or `/app`) with interactive controls (sliders/toggles: energy load, peak shaving threshold, grid tariff multiplier, battery split).
   - Dynamic telemetry visualizer (charts/gauges: baseline vs split kW, grid load, cost reduction up to 45%, carbon offset).
   - AI Co-Pilot chat interface with simulated contextual intelligence (energy queries, tariff rescheduling, anomaly diagnostics).
   - Global Navbar and Hero "Launch App" and "Sign In" CTAs directing to `/demo`.

3. **Milestone 2: Scalable Cloud SaaS & Developer API Architecture (R2)**:
   - Remove agency/manual setup language; introduce automated cloud onboarding.
   - API & Integrations showcase (OpenADR, Enphase, SolarEdge, Tesla Powerwall, REST/Webhooks).
   - Revamped modern SaaS pricing (Developer Free sandbox, Pro $29/mo, Enterprise Cloud).
   - "Start Free Trial / Launch Console" interactive modal.

4. **Milestone 3: Dedicated AI/ML Engine & Architecture Showcase (R3)**:
   - Deep Time-Series Neural Forecasting & Tariff Arbitrage Engine section.
   - Autonomous LLM Co-Pilot for multi-modal energy grid orchestration section.
   - Technical performance specs (<120ms latency, continuous reinforcement learning).

5. **Milestone 4: Executive Founder & Enterprise Positioning (R4)**:
   - Update Xavier's profile to "Founder & Chief Architect" highlighting AI/ML systems & cloud infrastructure.
   - Upgrade Contact section to "Enterprise Sales, Utility Partnerships & Developer API Support".

6. **Milestone 5: Verification, Zero-Error Build & Git Delivery (R5)**:
   - Verify `npm run build` succeeds with zero errors.
   - Verify all links, simulator interactivity, responsive design, and tests.
   - Commit all changes cleanly and push to `origin main`.
