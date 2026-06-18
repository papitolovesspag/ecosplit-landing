# E2E Refinement Handoff Report

This handoff report details the findings and plans for updating the EcoSplit AI E2E tests based on the new user requirements.

---

## 1. Observation

During read-only inspection, the following details were identified:

1. **How It Works Section Tests** (`e2e/tests/how-it-works.spec.js`):
   * At line 39: `const stickyWrapper = page.locator('section#how-it-works [class*="sticky-wrapper"], section#how-it-works [style*="height"]');`
   * At lines 80-89 (Case 19): `test('Case 19: Scroll transitions from Step 2 to Step 3 display final energy efficiency split logic state', ...)` which scrolling uses `window.scrollBy(0, 1500)` and expects Step 3.
   * At lines 92-106 (Case 20): `test('Case 20: Reversing scroll directions correctly updates active step index backwards', ...)` which scrolling uses `window.scrollBy(0, 1500)` then `window.scrollBy(0, -800)`.
2. **About Us Section Tests** (`e2e/tests/about-us.spec.js`):
   * At lines 15-18 (Case 22): Checks `.about-card`.
   * At lines 20-23 (Case 23): Checks `.team-member`.
   * At lines 25-28 (Case 24): Checks mission text.
   * At lines 37-49 (Case 26) & 51-60 (Case 27): Check team member card hovers and social media links.
3. **Contact Us Section Tests** (`e2e/tests/contact-us.spec.js`):
   * At lines 46-52 (Case 35): `test('Case 35: Visual layout of form is responsive and matches dark theme styling', ...)`
4. **End-to-End User Scenarios** (`e2e/tests/scenarios.spec.js`):
   * At lines 20-29 (Case 45): Performs three scrolls, then asserts `[data-step="3"]`.
   * At lines 39-47 (Case 46): Locates `.team-member` and its social links.
5. **Direct E2E Test Execution Command**:
   * Running `node e2e/runner.js` directly prints:
     ```
     ==================================================
       ECOSPLIT AI E2E RUNNER - GREENFIELD VALIDATION MODE
     ==================================================
     Reason: Website not implemented / server offline
     ```
     Exiting with code `1`.

---

## 2. Logic Chain

1. **Step 4 Scroll Integration**:
   * Since Step 4 represents the new 'AI Co-Pilot / Chatbot' feature and the sticky height needs to map to `400vh`, the height validation in Case 16 must look for `400vh` inline styling and computed height.
   * To check transitions up to Step 4, we must scroll down further (e.g. to `2000px`) in Case 20, assert `[data-step="4"]`, and keep the reverse scroll validation in Case 20.
   * In `scenarios.spec.js` Case 45, we must add an extra `window.scrollBy(0, 500)` call to reach Step 4 and assert `[data-step="4"]` as the final state.
2. **About Us Founder Profile**:
   * Because the layout centers around a Founder Profile instead of generic multiple team member cards, Case 22-24, 26-27 in `about-us.spec.js` must look for `.founder-profile` (or `[class*="founder"]`), a founder image placeholder, a founder bio placeholder, and a company mission statement.
   * In `scenarios.spec.js` Case 46, the locator must look for the founder profile card instead of a team member card.
3. **Contact Us Placeholders/Icons**:
   * To verify that placeholders/icons for GitHub, LinkedIn, Email, and Phone number are present, Case 35 (which previously only checked responsive layout) can be replaced with explicit checks for these icons.

---

## 3. Caveats

* The developer/implementer must ensure that the CSS class names and selectors in the HTML implementation match those in the tests (e.g. `founder-profile`, `founder-image`, `founder-bio`, `mission-statement`, and social link attributes like `a[href*="github"]`, `a[href*="linkedin"]`, `a[href*="mailto:"]`, `a[href*="tel:"]`).
* The Next.js development server must be running on port 3000 to execute tests in active/non-Greenfield mode.

---

## 4. Conclusion

A precise plan and drop-in replacements have been prepared to implement the 3 new requirements without modifying the total test count (53) or changing the test runner structure, keeping Greenfield mode fully functional. The proposed files are saved in the working directory:
* `proposed_how-it-works.spec.js`
* `proposed_about-us.spec.js`
* `proposed_contact-us.spec.js`
* `proposed_scenarios.spec.js`
* `proposed_runner.js`
* `proposed_TEST_INFRA.md`
* `proposed_TEST_READY.md`

---

## 5. Verification Method

1. Run the test runner in Greenfield validation mode:
   ```bash
   node e2e/runner.js
   ```
   Verify that it exits with code 1 and prints all 53 test cases successfully.
2. Inspect the proposed files under `.agents/explorer_e2e_refinement/` to confirm they contain the correct selector updates and assertions matching the requirements.
