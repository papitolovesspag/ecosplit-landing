## 2026-06-16T15:52:32Z
You are the E2E Refinement Worker for the EcoSplit AI landing page project.
Your working directory is: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/worker_e2e_refinement
Your parent is: 39ffdc51-fc3a-4557-b964-1772a50a0320

Your task is to refine the E2E testing files to incorporate both the structural updates (Step 4 scroll/AI Chatbot, Founder Profile layout centering, and GitHub/LinkedIn/Email/Phone placeholders) and the newly requested Pricing section (glassmorphic pricing cards, deep dark mode aesthetic, neon glowing borders, two tiers: Free Core and AI Premium).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please execute the following steps:
1. Read the handoff report and proposed files in `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/explorer_e2e_refinement/`.
2. Copy the proposed spec files, runner, and documentation over to the main `e2e/` folder and project root:
   - `proposed_how-it-works.spec.js` -> `e2e/tests/how-it-works.spec.js`
   - `proposed_about-us.spec.js` -> `e2e/tests/about-us.spec.js`
   - `proposed_contact-us.spec.js` -> `e2e/tests/contact-us.spec.js`
   - `proposed_scenarios.spec.js` -> `e2e/tests/scenarios.spec.js`
   - `proposed_runner.js` -> `e2e/runner.js`
   - `proposed_TEST_INFRA.md` -> `TEST_INFRA.md`
   - `proposed_TEST_READY.md` -> `TEST_READY.md`
3. Refine the test suite to incorporate the new **Pricing** section:
   - Write a new spec file `e2e/tests/pricing.spec.js` with 10 test cases (5 for Tier 1 presence/details/tiers, 5 for Tier 2 hovers/monthly-yearly toggling/accessibility/responsiveness).
   - The pricing selector should be `section#pricing` and the pricing card selectors should be `.pricing-card`.
   - Update `e2e/tests/scenarios.spec.js` to add a scenario verifying a pricing checkout or select flow (Tier 4 scenario).
   - Update `e2e/runner.js` to include the pricing spec and ensure the total test count outputs **63 test cases** in Greenfield validation mode.
   - Update `TEST_INFRA.md` and `TEST_READY.md` to document the Pricing section tests, select pricing cards, and reflect the new total of 63 test cases.
4. Execute `npm run test:e2e` or `node e2e/runner.js` to ensure the runner works correctly in Greenfield validation mode (outputs a structured checklist of all 63 test cases, showing them as [FAIL] with reason "Website not implemented / server offline", and exits with code 1).
5. Compile your handoff.md report and send a completion message back to the parent.
