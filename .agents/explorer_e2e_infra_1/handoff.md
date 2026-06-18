# Greenfield E2E Testing Infrastructure Design Report

This report outlines the designed E2E testing infrastructure for the **EcoSplit AI Landing Page**. It details a 4-tier test plan comprising 49 comprehensive test cases and recommends a robust, dual-mode test runner strategy that fails gracefully in this greenfield state.

---

## 1. Observation
1. A listing of the project root directory (`c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing`) via the `list_dir` tool returns only:
   - `.agents/` (agent workspace directory)
   - `ORIGINAL_REQUEST.md` (root request for EcoSplit AI project)
   - `PROJECT.md` (project architectural specification and milestones)
2. No `package.json`, `src/`, or `e2e/` directories are present. The project is currently in a 100% greenfield state with no implementation code or running local servers.
3. The visual spec in `PROJECT.md` demands:
   - "deep dark mode styling with vibrant neon accents and glassmorphism"
   - "scroll-controlled component using Framer Motion's useScroll and useTransform"
   - "Three.js canvas setup for fluid 3D abstract neon particles"
   - "Contact form validation and responsive design"
4. The milestones defined in `PROJECT.md` place this work in **Milestone 1 (E2E Testing Track)**: "Define feature inventory and build E2E test suite (Tiers 1-4) in `e2e/`, publishing `TEST_READY.md`."

---

## 2. Logic Chain
1. **Runner Requirements**: E2E testing needs to verify visual layouts (dark mode/neon), scroll-controlled triggers (How It Works animation steps), form validations (Contact Us), and performance.
2. **Core Tech Recommendation**: **Playwright** is chosen as the actual E2E test engine. Unlike Puppeteer or Cypress:
   - Playwright has superior built-in auto-waiting, scroll actions, and multi-browser support.
   - Playwright excels in visual regression comparisons (`toHaveScreenshot`), which is perfect for verifying the neon-on-dark visual theme.
   - It supports custom headers and throttling, which are required for mobile and performance scenarios.
3. **Greenfield Graceful Execution**: 
   - Directly running Playwright or other standard test suites when the project has no package/server would crash with TCP connection failures, unhandled promise rejections, or module-not-found exceptions, which disrupts automated validation workflows.
   - To make it "fail gracefully," we introduce a **custom Node.js test runner wrapper (`e2e/runner.js`)** written in zero-dependency Node.js code.
   - The wrapper pings `http://localhost:3000` (configurable) on startup.
   - If the server is offline, it executes a **Greenfield Validation (Dry-Run)**. It prints a structured test report checking off all 49 designed test cases, marks them as `FAILED` with the reason "Website not implemented / server offline", and exits with code `1`.
   - If the server is online, it dynamically checks for Playwright and spawns `npx playwright test`. If Playwright is missing, it lists tests, displays setup instructions, and exits with code `1`.
   - This ensures the E2E suite can be invoked at any stage of the development lifecycle, always returning a clean test report rather than a runtime crash.

---

## 3. Caveats
- **Environment**: The dry-run validation assumes port `3000` is the default Next.js local server port. The wrapper accepts an environment variable `PORT` to override this.
- **Playwright Installation**: Since this agent is in `CODE_ONLY` network mode, we cannot run an internet-facing `npm install` to download browser binaries. Thus, real browser test execution is deferred until the implementer setups the project dependencies and runs the project server.
- **WebGL Rendering Verification**: In real test execution, WebGL canvas performance and context loss are mocked or validated by capturing canvas screenshot digests or using browser console log listeners rather than inspecting the canvas binary directly.

---

## 4. Conclusion

### E2E Test Runner Strategy Recommendation
We recommend creating:
1. `e2e/runner.js`: The zero-dependency wrapper script (detailed in `proposed_runner.js`).
2. `e2e/tests/`: Playwright spec files containing actual test scripts that match the test case inventory.
3. `package.json` scripting: Add `"test:e2e": "node e2e/runner.js"` so it integrates seamlessly into the workflow.

### 4-Tier Test Case Inventory (49 Test Cases)

| Tier | Category / Feature | ID | Test Case Name | Expected Behavior / Verification Details |
|---|---|---|---|---|
| **Tier 1** | **Hero Section** | `Hero.1` | Title & Tagline Visibility | Main H1 heading "EcoSplit AI" and tagline are present in the viewport and readable. |
| **Tier 1** | **Hero Section** | `Hero.2` | CTA Navigation | Clicking the primary CTA button smooth-scrolls the page viewport to `#how-it-works`. |
| **Tier 1** | **Hero Section** | `Hero.3` | WebGL Background Presence | A `canvas` element associated with WebGL/Three.js rendering is detected in the DOM. |
| **Tier 1** | **Hero Section** | `Hero.4` | Glassmorphic Cards Rendered | Component structures with CSS classes matching glassmorphic specs (backdrop-filter) are in the DOM. |
| **Tier 1** | **Hero Section** | `Hero.5` | Navbar Links & Routing | Global navigation links update the window location hash (e.g., `#about-us`) when clicked. |
| **Tier 1** | **How It Works** | `HowItWorks.1` | Sticky Container Height | Scroll animation container has CSS sticky positioning and has a scrollable height of `300vh`. |
| **Tier 1** | **How It Works** | `HowItWorks.2` | Scroll Step 1 Transition | Scrolling into the section triggers active Step 1 content (e.g. Asset Identification) and hides other steps. |
| **Tier 1** | **How It Works** | `HowItWorks.3` | Scroll Step 2 Transition | Scrolling further (33-66%) hides Step 1, displays Step 2 (e.g. AI Energy Splitting Analysis) and updates graphic state. |
| **Tier 1** | **How It Works** | `HowItWorks.4` | Scroll Step 3 Transition | Scrolling near the bottom (66-100%) displays Step 3 (e.g. Cost Distribution) and finishes the abstract animation. |
| **Tier 1** | **How It Works** | `HowItWorks.5` | Step Indicator Interactivity | Clicking on the step indicators (bullets) scrolls the window to the exact height associated with that step. |
| **Tier 1** | **About Us** | `AboutUs.1` | Team Profile Cards Rendered | A grid of team profiles with glassmorphic styling is fully rendered in the About Us section. |
| **Tier 1** | **About Us** | `AboutUs.2` | Neon Hover Effects | Hovering a team profile card triggers a CSS transition showing neon borders (`box-shadow` with glow variables). |
| **Tier 1** | **About Us** | `AboutUs.3` | Tech Stack/Mission Content | Company mission statements and tech stack overview texts are present and visible. |
| **Tier 1** | **About Us** | `AboutUs.4` | Layout Responsiveness | About Us grid displays 3 columns on desktop (>=1024px) and stacks into 1 column on mobile (<768px). |
| **Tier 1** | **About Us** | `AboutUs.5` | Social Links Functional | Social links open correct profiles in a new tab with `target="_blank"` and `rel="noopener noreferrer"`. |
| **Tier 1** | **Contact Us** | `ContactUs.1` | Form Inputs Rendered | Form elements for Name, Email, Subject, Message, and Submit button are visible and active. |
| **Tier 1** | **Contact Us** | `ContactUs.2` | Visual Validation Errors | Submitting empty fields triggers client-side validation, shows red neon borders, and displays error messages. |
| **Tier 1** | **Contact Us** | `ContactUs.3` | Form Submission Success | Submitting valid inputs displays a glassmorphic success modal/toast and clears the form. |
| **Tier 1** | **Contact Us** | `ContactUs.4` | Glassmorphic Focus Styling | Focus on form inputs triggers a border color transition to neon green/cyan with shadow highlighting. |
| **Tier 1** | **Contact Us** | `ContactUs.5` | Input Character Counter | The message textarea displays a real-time character counter showing limit enforcement (e.g., `x/1000`). |
| **Tier 2** | **Hero Section** | `Hero.B1` | Ultra-wide Viewport Scaling | Canvas and layout scale without horizontal overflow or text clipping at viewports > 2560px. |
| **Tier 2** | **Hero Section** | `Hero.B2` | Mobile Landscape Aspect Ratio | Text elements and navbar stay accessible and do not overlap on 812x375 (landscape mobile) viewports. |
| **Tier 2** | **Hero Section** | `Hero.B3` | WebGL Loss Graceful Fallback | Simulating WebGL context loss triggers a fallback CSS radial gradient background, logging a warning. |
| **Tier 2** | **Hero Section** | `Hero.B4` | Slow Network Fallback | Page text is interactive immediately even if Three.js scripts take 5s+ to load (lazy loading enabled). |
| **Tier 2** | **Hero Section** | `Hero.B5` | Custom Font Load Failure | Page displays fallback system sans-serif fonts without causing layouts shifts (CLS = 0) if external fonts fail. |
| **Tier 2** | **How It Works** | `HowItWorks.B1` | Rapid Scroll Jitter Stability | Rapid scroll up/down stress test does not cause graphic overlapping or trigger layout glitches. |
| **Tier 2** | **How It Works** | `HowItWorks.B2` | Mid-scroll Reload Init | Reloading the page at 50% scroll correctly computes the container offset and mounts Step 2 as active. |
| **Tier 2** | **How It Works** | `HowItWorks.B3` | Input Device Scroll Support | Scroll events from trackpad swipes, high-precision scroll wheels, and Page Down keys correctly trigger steps. |
| **Tier 2** | **How It Works** | `HowItWorks.B4` | Extreme Low-Height Viewport | Sticky container scales down contents dynamically and does not crop text at viewport heights < 400px. |
| **Tier 2** | **How It Works** | `HowItWorks.B5` | Mobile Touch Scroll Sensitivity | Swipe gesture thresholds on touchscreens successfully transition scroll frames without getting stuck. |
| **Tier 2** | **About Us** | `AboutUs.B1` | Long Text Bio Expansion | Dynamic names/bios of unusual length (e.g. 500 chars) expand cards downwards and reflow without grid breaks. |
| **Tier 2** | **About Us** | `AboutUs.B2` | WCAG Contrast Compliancy | Neon cyan/green text elements on dark glassmorphic cards have a verified contrast ratio >= 4.5:1. |
| **Tier 2** | **About Us** | `AboutUs.B3` | Avatar Load Fail Fallback | If the team member's avatar image fails to load, a stylized initials-placeholder is rendered in its place. |
| **Tier 2** | **About Us** | `AboutUs.B4` | Keyboard Focus Rings | Tabbing through team cards shows a highly visible, custom focus outline (neon cyan ring). |
| **Tier 2** | **About Us** | `AboutUs.B5` | Hover Stress Test | Triggering mouseenter/mouseleave events at 50Hz does not cause state queues or lingering hover overlays. |
| **Tier 2** | **Contact Us** | `ContactUs.B1` | SQL/Script Sanitization | Entering HTML tags, script snippets, and SQL characters in fields displays no execution and is sanitized. |
| **Tier 2** | **Contact Us** | `ContactUs.B2` | Extreme Length Text Paste | Pasting 10,000+ characters into message triggers a validation boundary error, blocking submission. |
| **Tier 2** | **Contact Us** | `ContactUs.B3` | Form Double-Submit Prevent | Clicking the Submit button multiple times in 100ms disabled the button, submitting only once. |
| **Tier 2** | **Contact Us** | `ContactUs.B4` | Complex Email Rejection | Rejects invalid email patterns (e.g., `test@`, `@test.com`, `test@test..com`) while accepting aliases. |
| **Tier 2** | **Contact Us** | `ContactUs.B5` | Submit Network Timeout | Mocking a 15s API timeout shows a friendly error message, preserving user inputs for retry. |
| **Tier 3** | **Cross-Feature** | `Cross.1` | Active Nav Link State Sync | Scrolling dynamically updates the active section indicator highlighted class in the global navbar. |
| **Tier 3** | **Cross-Feature** | `Cross.2` | Scroll to WebGL Speed Sync | Rapid page scrolling increases Three.js particle velocity/density; resting restores calm floating state. |
| **Tier 3** | **Cross-Feature** | `Cross.3` | Hero CTA & Scroll Animation | Hero CTA click triggers a smooth scroll to `#how-it-works`, activating Step 1 transition. |
| **Tier 3** | **Cross-Feature** | `Cross.4` | Sequential Tab Traversal | Keyboard navigation sequence: Navbar -> Hero components -> About Us cards -> Contact Form fields. |
| **Tier 4** | **End-to-End** | `Scenario.1` | First-time Visitor Journey | Simulate initial load -> scroll through Hero -> scroll 3 steps of How It Works -> read Team -> submit form. |
| **Tier 4** | **End-to-End** | `Scenario.2` | Mobile Cellular Session | Simulates a mobile device on Slow 3G network: verifies responsive layout, lazy-loaded components, low CPU. |
| **Tier 4** | **End-to-End** | `Scenario.3` | Investor Research Session | Rapid scroll to About Us -> click team social links -> scroll back to Hero. Verifies links work and scroll survives. |
| **Tier 4** | **End-to-End** | `Scenario.4` | Screen Reader Navigation Auditing | Checks accessibility metrics: ARIA roles, labels on fields, semantic headers structure, bypass links. |
| **Tier 4** | **End-to-End** | `Scenario.5` | Performance & CLS Emulation | Measures page performance: zero layout shifts (CLS=0) during lazy WebGL setup and font loading. |

---

## 5. Verification Method
1. **Runner Execution Test**: 
   - Execute the proposed test runner locally using Node:
     ```bash
     node c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/explorer_e2e_infra_1/proposed_runner.js
     ```
   - **Expected Result**: The script detects that the Next.js server is not running on port 3000, launches Greenfield Validation mode, prints all 49 test cases as `[FAIL]`, outputs a summary block, and exits cleanly with exit code `1`.
2. **Playwright Integration Test**:
   - Start a dummy HTTP server on port 3000 (e.g., using `npx http-server` or python's HTTP server).
   - Execute the test runner again.
   - **Expected Result**: The script detects the active server on port 3000 and attempts to launch Playwright tests. If Playwright is not installed in the environment, it displays setup instructions and exits with code `2`.
