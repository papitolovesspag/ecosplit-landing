## 2026-06-16T15:24:57Z

You are the E2E Theme Toggle Worker. Your working directory is: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/worker_e2e_theme

Your mission is to integrate 4 new E2E test cases validating a seamless light/dark mode theme toggle into the existing E2E Testing Track infrastructure:
1. **Tier 1**: "Theme Toggle UI Presence" - Verify that a theme toggle control is present in the navigation/header and displays the correct active theme state/icon.
2. **Tier 2**: "Theme State Persistence" - Toggle the theme to Light Mode, reload the page, and verify that the theme state persists as Light Mode.
3. **Tier 3**: "Theme Toggle WebGL Background Sync" - Toggle the theme and verify that CSS variables and the WebGL background canvas configurations update to match the active theme.
4. **Tier 4**: "Light Mode Contrast/A11y Conformance" - Emulate light mode, check that the page layout transitions cleanly, and verify that text elements meet WCAG contrast ratio (>= 4.5:1) in Light Mode.

Instructions:
1. Read the existing E2E files at:
   - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/TEST_INFRA.md`
   - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/TEST_READY.md`
   - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/e2e/runner.js`
   - Files in `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/e2e/tests/`
2. Update `TEST_INFRA.md` and `TEST_READY.md` to include these 4 new theme toggle test cases under their respective tiers (increasing total test count from 49 to 53).
3. Update `e2e/runner.js` to register these 4 new test cases. Ensure that in Greenfield validation mode (when the server is offline), the runner outputs all 53 test cases as failed.
4. Write the actual Playwright E2E tests for these 4 new test cases. You can create a new spec file `e2e/tests/theme.spec.js` containing these tests using the `@playwright/test` API. Selectors should align with common UI patterns (e.g. `button#theme-toggle`).
5. Execute the runner command: `node e2e/runner.js`. Verify that it runs cleanly, prints the list of all 53 test cases as [FAIL], and exits with code 1.
6. Deliver your handoff report to: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/worker_e2e_theme/handoff.md.
7. Send a message to your parent (main agent) with the path to your handoff report and a summary of your changes.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
