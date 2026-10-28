## 2026-10-26T16:41:07Z
You are Worker 1 (teamwork_preview_worker) implementing Milestone 1: Live Interactive MVP Simulator & AI Co-Pilot Portal.
Working directory: c:\Users\HP\Documents\Web Dev projects\ecosplit-landing\.agents\teamwork\worker_m1
Project root: c:\Users\HP\Documents\Web Dev projects\ecosplit-landing
MANDATORY: You MUST read the original request file first: `c:\Users\HP\Documents\Web Dev projects\ecosplit-landing\.agents\teamwork\ORIGINAL_REQUEST.md`.
Also read:
- Master project blueprint: `c:\Users\HP\Documents\Web Dev projects\ecosplit-landing\PROJECT.md`
- Explorer 3 Architecture Blueprint: `c:\Users\HP\Documents\Web Dev projects\ecosplit-landing\.agents\teamwork\explorer_survey_3\analysis.md`
- Explorer 1 Infrastructure Report: `c:\Users\HP\Documents\Web Dev projects\ecosplit-landing\.agents\teamwork\explorer_survey_1\analysis.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own and may write to:
- `src/app/demo/page.tsx`
- `next.config.ts` (for `/app` -> `/demo` redirect if appropriate, preserving existing config)
You MUST NOT write to any other source files.

MISSION & SPECIFICATIONS FOR `/demo`:
Implement a rich, production-grade, interactive energy load-balancing simulator portal and reactive AI Co-Pilot at `src/app/demo/page.tsx`:
1. **Interactive Load-Balancing Controls**:
   - Sliders and reactive numeric inputs for:
     * Base Energy Load (2.0 to 25.0 kW, default ~12.5 kW)
     * Peak Shaving Threshold (2.0 to 20.0 kW, default ~7.5 kW)
     * Grid Tariff Multiplier ($0.12 to $0.72 / kWh, default ~$0.48 / kWh peak tier)
     * Battery Storage Split (0% to 100%, default ~65% dispatch)
   - 4 Instant Operational Preset Buttons:
     * "Peak Tariff Arbitrage": Clamps grid, maximizes battery discharge during spike
     * "Green Grid / Low Carbon": Shifts deferrable load to renewable window, minimizes peak emissions
     * "Critical Grid Stress / Peaker Event": Drastic load shedding and 100% battery assist
     * "EV Fleet & Heavy Load Spike": Simulates large multi-vehicle charging spike with dynamic load-splitting
2. **Real-Time Telemetry & Visualizer Engine**:
   - Zero-lag reactive mathematical calculations:
     * Split load: active grid import vs battery discharge vs smart deferred load
     * Cost reduction percentage (up to 45% based on tariff differential and peak shaved)
     * Hourly and projected annual savings ($ avoided)
     * Real-time carbon offset (kg CO2 avoided)
   - High-fidelity visual components (using pure SVG and Lucide/react-icons to guarantee zero React 19 incompatibilities):
     * Circular radial gauge for Cost Reduction % (glowing neon emerald/cyan)
     * Interactive 24-Hour Dispatch Waveform (SVG showing baseline curve vs clamped grid curve vs battery assist vs deferred load)
     * Animated power flow topology (Grid -> Smart Splitter -> Battery / Critical Loads / Deferred Loads)
     * Live KPI metric cards (Active Grid Draw, Battery State of Charge, Avoided Cost, Grid Emission Index)
3. **Interactive AI Co-Pilot / Assistant**:
   - Conversational energy intelligence panel with chat history.
   - 4 Executable Quick Prompt Pills:
     * 'Optimize for peak tariff'
     * 'Diagnose load anomaly'
     * 'Simulate grid outage'
     * 'Forecast tomorrow peak'
   - Clicking a pill or sending a natural language prompt executes contextual energy optimization logic:
     * Dynamically mutates the simulator sliders (e.g. adjusts peak threshold or battery split)
     * Returns structured diagnostic reports including inference latency (~84ms to 118ms), model attribution (NeuralSplit-v2.4), and clear mathematical arbitrage explanations.
   - Freeform message input allowing user queries and commands.
4. **Console Header & Navigation**:
   - Top bar with EcoSplit AI logo, "Live Simulation Console" badge, live pulse indicator ("🟢 Telemetry Stream Active | 84ms Latency"), and a clear "← Return to Landing" link back to `/`.
5. **Styling & Theme Compatibility**:
   - Uses the project's glassmorphic design language, CSS custom variables (`var(--primary)`, `var(--secondary)`, `var(--card-bg)`, `var(--foreground)`), and clean dark/light responsiveness.
6. **Verification**:
   - Run `npm.cmd run build` (remember to use `npm.cmd` on Windows PowerShell) to verify zero TypeScript and Next.js errors.
   - Document commands executed and exact build output in your handoff report.
7. **Handoff**:
   - Write your complete handoff report to `c:\Users\HP\Documents\Web Dev projects\ecosplit-landing\.agents\teamwork\worker_m1\handoff.md`.
   - Send a message to orchestrator with your results.
