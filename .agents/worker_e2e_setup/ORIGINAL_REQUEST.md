# Original Request

Received: 2026-06-16T16:22:29+01:00

You are the E2E Test Setup Worker. Your working directory is: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/worker_e2e_setup

Your mission is to implement the E2E testing infrastructure for the EcoSplit AI landing page.

Follow these steps exactly:
1. Initialize a basic `package.json` in the project root if it does not exist. Add standard metadata, scripts (`"test:e2e": "node e2e/runner.js"`), and devDependencies (`@playwright/test`).
2. Try running `npm install` to set up Playwright. Note: you are in CODE_ONLY network mode; if the network blocks package download, that is expected. Your runner must handle the fallback gracefully!
3. Design and write `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/TEST_INFRA.md` following the playbook template. It must list all 49 test cases across Tiers 1-4.
4. Create the `e2e` folder and `e2e/tests` folder in the project.
5. Create `e2e/runner.js` as a hybrid runner:
   - It should check if a server is running on port 3000.
   - If the server is offline (or Playwright is not installed), it executes in Greenfield validation mode: prints a colored, structured checklist of the 49 test cases as [FAIL] with the reason "Website not implemented / server offline", shows a summary, and exits with code 1.
   - If the server is online and Playwright is installed, it spawns `npx playwright test`.
6. Write the actual Playwright tests in `e2e/tests/` covering the 49 test cases across:
   - `e2e/tests/hero.spec.js` (Tier 1 & Tier 2 Hero tests - 10 cases)
   - `e2e/tests/how-it-works.spec.js` (Tier 1 & Tier 2 How It Works tests - 10 cases)
   - `e2e/tests/about-us.spec.js` (Tier 1 & Tier 2 About Us tests - 10 cases)
   - `e2e/tests/contact-us.spec.js` (Tier 1 & Tier 2 Contact Us tests - 10 cases)
   - `e2e/tests/cross-feature.spec.js` (Tier 3 tests - 4 cases)
   - `e2e/tests/scenarios.spec.js` (Tier 4 tests - 5 cases)
   Make sure the selectors match the IDs/classes from PROJECT.md: `section#hero`, `section#how-it-works`, `section#about-us`, `section#contact-us`, `form#contact-form`, `canvas#webgl-background` (or equivalent).
7. Execute the runner command: `node e2e/runner.js` (or `npm run test:e2e`). Validate that it runs, outputs the failing dry-run checklist of 49 cases, and exits with code 1. Document the command run and the exact output.
8. Create `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/TEST_READY.md` in the project root with the test running command and coverage details.
9. Deliver your handoff report to: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/worker_e2e_setup/handoff.md.
10. Send a message to your parent (main agent) with the path to your handoff report and a summary of what you did.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-06-16T15:24:43Z
**Context**: Update to landing page requirements - Theme Toggle.
**Content**: The parent agent has requested that the E2E test suite include test cases validating a seamless light/dark mode theme toggle in the UI. 
Please add the following test cases to the test suite and inventory:
1. **Tier 1 (Feature Coverage)**: "Theme Toggle UI Presence" - Verify that a theme toggle control is present in the navigation/header and displays the correct active theme state/icon.
2. **Tier 2 (Boundary/Edge Cases)**: "Theme State Persistence" - Toggle the theme to Light Mode, reload the page, and verify that the theme state persists as Light Mode.
3. **Tier 3 (Cross-Feature Combinations)**: "Theme Toggle WebGL Background Sync" - Toggle the theme and verify that CSS variables and the WebGL background canvas configurations update to match the active theme.
4. **Tier 4 (Real-World Scenarios)**: "Light Mode Contrast/A11y Conformance" - Emulate light mode, check that the page layout transitions cleanly, and verify that text elements meet WCAG contrast ratio (>= 4.5:1) in Light Mode.
Ensure these are written in your spec files (e.g. in a new or existing spec file like `e2e/tests/theme.spec.js` or integrated into the others), listed in `TEST_INFRA.md` and `TEST_READY.md`, and handled by the runner.
**Action**: Incorporate these theme toggle test cases into your active implementation task, run verification, and write them to `TEST_INFRA.md` and `TEST_READY.md`.

