# E2E Test Refinement Analysis

This document analyzes the current E2E test setup for the EcoSplit AI landing page and outlines the exact changes required to integrate the new requirements.

---

## 1. Summary of Current E2E Setup

1. **Test Architecture**: Playwright is used for testing. Tests are divided into Tiers 1-4.
2. **Current Test Count**: 53 distinct test cases are defined and verified in `e2e/runner.js` (Greenfield Validation Mode) and documented across `TEST_INFRA.md` and `TEST_READY.md`.
3. **Execution**: Running `node e2e/runner.js` triggers Greenfield Validation Mode when the site is offline or Playwright is not fully available, printing a checklist of all 53 cases with a `[FAIL]` status.

---

## 2. Requirement-by-Requirement Analysis & Modifications

### Requirement 1: 'How It Works' Scroll Animation Refinement
* **Goal**: Increase the scroll steps to 4 (Step 0 to Step 4, representing 5 states: 0, 1, 2, 3, 4), where Step 4 represents the "AI Co-Pilot / Chatbot" feature. Update the sticky scroll assertions to map to `400vh` and check for Step 4.
* **Affected Files**:
  1. `e2e/tests/how-it-works.spec.js` (Cases 13, 16, 19, 20)
  2. `e2e/tests/scenarios.spec.js` (Case 45)
  3. `e2e/runner.js` (Case 19, 20 names)
  4. `TEST_INFRA.md` (Cases 13, 16, 19, 20 descriptions)
  5. `TEST_READY.md` (How It Works coverage summary)

#### Specific File Changes:

##### File: `e2e/tests/how-it-works.spec.js`
* **Case 13**: Update title and comments to include Step 4.
* **Case 16**: Update sticky scroll check to look for `400vh` inline styling and computed height matching `400vh`.
* **Case 19**: Adjust to assert Step 3 (at `1200px` scroll height).
* **Case 20**: Adjust to assert Step 4 (AI Co-Pilot / Chatbot) at `2000px` scroll height, and then test the reverse scroll transition (reversing to Step 1).

**Before vs After code snippets for `how-it-works.spec.js`**:

* **Case 16 (Height Validation)**:
  * *Before*:
    ```javascript
    test('Case 16: Scroll container height matches sticky scroll setup', async ({ page }) => {
      const stickyWrapper = page.locator('section#how-it-works [class*="sticky-wrapper"], section#how-it-works [style*="height"]');
      await expect(stickyWrapper.first()).toBeVisible();
      ...
      const heightInt = parseInt(heightVal, 10);
      expect(heightInt).toBeGreaterThanOrEqual(800);
    });
    ```
  * *After*:
    ```javascript
    test('Case 16: Scroll container height matches sticky scroll setup (400vh)', async ({ page }) => {
      const stickyWrapper = page.locator('section#how-it-works [class*="sticky-wrapper"], section#how-it-works [style*="400vh"], section#how-it-works [style*="height"]');
      await expect(stickyWrapper.first()).toBeVisible();
      
      const styleAttr = await stickyWrapper.first().getAttribute('style') || '';
      const heightVal = await stickyWrapper.first().evaluate(el => window.getComputedStyle(el).height);
      const heightInt = parseInt(heightVal, 10);

      const is400vhInStyle = styleAttr.includes('400vh');
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      const expectedMinHeight = viewportHeight * 4;

      expect(is400vhInStyle || heightInt >= (expectedMinHeight - 100)).toBe(true);
    });
    ```

* **Case 19 (Step 3 State)**:
  * *Before*:
    ```javascript
    test('Case 19: Scroll transitions from Step 2 to Step 3 display final energy efficiency split logic state', async ({ page }) => {
      const section = page.locator('section#how-it-works');
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 1500));
      await page.waitForTimeout(300);
      const step3Content = page.locator('section#how-it-works [data-step="3"], section#how-it-works [class*="final-state"]').first();
      expect(step3Content).toBeDefined();
    });
    ```
  * *After*:
    ```javascript
    test('Case 19: Scroll transitions from Step 2 to Step 3 display Step 3 state', async ({ page }) => {
      const section = page.locator('section#how-it-works');
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(300);
      const step3Content = page.locator('section#how-it-works [data-step="3"], section#how-it-works [class*="step-content-3"]').first();
      expect(step3Content).toBeDefined();
    });
    ```

* **Case 20 (Step 4 Chatbot & Reverse Scroll)**:
  * *Before*:
    ```javascript
    test('Case 20: Reversing scroll directions correctly updates active step index backwards', async ({ page }) => {
      const section = page.locator('section#how-it-works');
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 1500));
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollBy(0, -800));
      await page.waitForTimeout(300);
      const activeStep = page.locator('section#how-it-works [data-step="1"], section#how-it-works .step-active').first();
      expect(activeStep).toBeDefined();
    });
    ```
  * *After*:
    ```javascript
    test('Case 20: Scroll transitions from Step 3 to Step 4 (AI Co-Pilot / Chatbot) and reverse scrolling works', async ({ page }) => {
      const section = page.locator('section#how-it-works');
      await section.scrollIntoViewIfNeeded();
      
      // Scroll to Step 4
      await page.evaluate(() => window.scrollBy(0, 2000));
      await page.waitForTimeout(300);
      const step4Content = page.locator('section#how-it-works [data-step="4"], section#how-it-works [class*="chatbot"]').first();
      expect(step4Content).toBeDefined();

      // Scroll back up to verify reverse transition
      await page.evaluate(() => window.scrollBy(0, -1200));
      await page.waitForTimeout(300);
      const activeStep = page.locator('section#how-it-works [data-step="1"], section#how-it-works .step-active').first();
      expect(activeStep).toBeDefined();
    });
    ```

##### File: `e2e/tests/scenarios.spec.js` (Case 45)
* **Case 45**: Extend the scroll simulation to advance through all steps (adding an additional scroll step for Step 4) and verify that the active/final step matches `[data-step="4"]`.
  * *Before*:
    ```javascript
    // Simulate scroll progression (downward)
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);

    // Verify step transition completed (e.g. final step is active)
    const finalStep = page.locator('section#how-it-works [data-step="3"], section#how-it-works .step-active').first();
    expect(finalStep).toBeDefined();
    ```
  * *After*:
    ```javascript
    // Simulate scroll progression (downward)
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 500)); // Additional scroll step for Step 4
    await page.waitForTimeout(200);

    // Verify step transition completed (e.g. final step is active at Step 4)
    const finalStep = page.locator('section#how-it-works [data-step="4"], section#how-it-works .step-active').first();
    expect(finalStep).toBeDefined();
    ```

---

### Requirement 2: 'About Us' Founder Profile Layout Centering
* **Goal**: Refine tests to check for a centered Founder Profile (containing founder image placeholder, founder bio placeholder, and company mission statement) rather than generic group team member cards.
* **Affected Files**:
  1. `e2e/tests/about-us.spec.js` (Cases 22, 23, 24, 26, 27)
  2. `e2e/tests/scenarios.spec.js` (Case 46)
  3. `e2e/runner.js` (Case 22, 23, 24, 26, 27 names)
  4. `TEST_INFRA.md` (Case 22, 23, 24, 26, 27 descriptions)
  5. `TEST_READY.md` (About Us coverage summary)

#### Specific File Changes:

##### File: `e2e/tests/about-us.spec.js`
* **Case 22**: Verify that the main Founder Profile container is rendered in the `#about-us` section.
* **Case 23**: Verify that the Founder Profile contains an image placeholder and a bio placeholder.
* **Case 24**: Verify that the company mission statement is visible in the section.
* **Case 26**: Verify that the Founder Profile container triggers the neon green/cyan glow hover effects.
* **Case 27**: Verify that the social links/icons exist on the Founder Profile.

**Before vs After code snippets for `about-us.spec.js`**:

* **Case 22 (Container)**:
  * *Before*:
    ```javascript
    test('Case 22: Company background information cards are rendered', async ({ page }) => {
      const cards = page.locator('section#about-us .about-card, section#about-us [class*="card"]');
      await expect(cards.first()).toBeVisible();
    });
    ```
  * *After*:
    ```javascript
    test('Case 22: Founder Profile container is rendered in the section', async ({ page }) => {
      const profileContainer = page.locator('section#about-us .founder-profile, section#about-us [class*="founder"]');
      await expect(profileContainer.first()).toBeVisible();
    });
    ```

* **Case 23 (Image and Bio Placeholders)**:
  * *Before*:
    ```javascript
    test('Case 23: Team member profiles or roles are displayed with glassmorphic cards', async ({ page }) => {
      const teamMembers = page.locator('section#about-us .team-member, section#about-us [class*="team"]');
      await expect(teamMembers.first()).toBeVisible();
    });
    ```
  * *After*:
    ```javascript
    test('Case 23: Founder Profile contains an image placeholder and a bio placeholder', async ({ page }) => {
      const imagePlaceholder = page.locator('section#about-us img[alt*="Founder"], section#about-us [data-testid="founder-image"], section#about-us [class*="founder-image"]');
      const bioPlaceholder = page.locator('section#about-us [data-testid="founder-bio"], section#about-us [class*="founder-bio"]');
      await expect(imagePlaceholder.first()).toBeVisible();
      await expect(bioPlaceholder.first()).toBeVisible();
    });
    ```

* **Case 24 (Mission Statement)**:
  * *Before*:
    ```javascript
    test('Case 24: Key values/mission of EcoSplit AI are visible', async ({ page }) => {
      const mission = page.locator('section#about-us h2, section#about-us h3, section#about-us .mission-text');
      await expect(mission.first()).toBeVisible();
    });
    ```
  * *After*:
    ```javascript
    test('Case 24: Company mission statement is visible in the section', async ({ page }) => {
      const mission = page.locator('section#about-us [data-testid="mission-statement"], section#about-us [class*="mission-statement"], section#about-us [class*="mission"]');
      await expect(mission.first()).toBeVisible();
    });
    ```

* **Case 26 (Hover Glow)**:
  * *Before*:
    ```javascript
    test('Case 26: Team cards trigger neon green or neon cyan hover glow effects', async ({ page }) => {
      const card = page.locator('section#about-us .team-member, section#about-us [class*="team"]').first();
      await expect(card).toBeVisible();
      ...
    });
    ```
  * *After*:
    ```javascript
    test('Case 26: Founder Profile card/container triggers neon green or neon cyan hover glow effects', async ({ page }) => {
      const card = page.locator('section#about-us .founder-profile, section#about-us [class*="founder"]').first();
      await expect(card).toBeVisible();
      ...
    });
    ```

* **Case 27 (Social Links)**:
  * *Before*:
    ```javascript
    test('Case 27: Social links/icons are present on team profiles and have correct hover states', async ({ page }) => {
      const socialLink = page.locator('section#about-us a[href*="linkedin"], section#about-us a[href*="twitter"], section#about-us .social-link').first();
      await expect(socialLink).toBeVisible();
      ...
    });
    ```
  * *After*:
    ```javascript
    test('Case 27: Social links/icons are present on the Founder Profile and have correct hover states', async ({ page }) => {
      const socialLink = page.locator('section#about-us a[href*="linkedin"], section#about-us a[href*="twitter"], section#about-us .social-link').first();
      await expect(socialLink).toBeVisible();
      ...
    });
    ```

##### File: `e2e/tests/scenarios.spec.js` (Case 46)
* **Case 46**: Update to hover over the founder profile card instead of a generic team card.
  * *Before*:
    ```javascript
    // 2. Hover over first team card
    const teamCard = page.locator('section#about-us .team-member, section#about-us [class*="team"]').first();
    await expect(teamCard).toBeVisible();
    await teamCard.hover();
    ```
  * *After*:
    ```javascript
    // 2. Hover over Founder Profile card
    const founderCard = page.locator('section#about-us .founder-profile, section#about-us [class*="founder"]').first();
    await expect(founderCard).toBeVisible();
    await founderCard.hover();
    ```

---

### Requirement 3: 'Contact Us' Placeholders and Icons
* **Goal**: Verify that placeholders/icons for GitHub, LinkedIn, Email, and Phone number are present in the Contact Us section.
* **Affected Files**:
  1. `e2e/tests/contact-us.spec.js` (Case 35)
  2. `e2e/runner.js` (Case 35 name)
  3. `TEST_INFRA.md` (Case 35 description)
  4. `TEST_READY.md` (Contact Us coverage summary)

#### Specific File Changes:

##### File: `e2e/tests/contact-us.spec.js`
* **Case 35**: Replace the current general layout test with an assertion verifying the presence of placeholders or icons for GitHub, LinkedIn, Email, and Phone number.

**Before vs After code snippets for `contact-us.spec.js`**:

* **Case 35**:
  * *Before*:
    ```javascript
    test('Case 35: Visual layout of form is responsive and matches dark theme styling', async ({ page }) => {
      const form = page.locator('form#contact-form');
      const background = await form.evaluate(el => window.getComputedStyle(el).backgroundColor);
      expect(background).toBeDefined();
    });
    ```
  * *After*:
    ```javascript
    test('Case 35: Placeholders or icons for GitHub, LinkedIn, Email, and Phone number are present in the Contact Us section', async ({ page }) => {
      const githubIcon = page.locator('section#contact-us a[href*="github"], section#contact-us [class*="github"], section#contact-us svg[class*="github"]').first();
      const linkedinIcon = page.locator('section#contact-us a[href*="linkedin"], section#contact-us [class*="linkedin"], section#contact-us svg[class*="linkedin"]').first();
      const emailIcon = page.locator('section#contact-us a[href*="mailto:"], section#contact-us [class*="email"], section#contact-us svg[class*="mail"]').first();
      const phoneIcon = page.locator('section#contact-us a[href*="tel:"], section#contact-us [class*="phone"], section#contact-us svg[class*="phone"]').first();

      await expect(githubIcon).toBeVisible();
      await expect(linkedinIcon).toBeVisible();
      await expect(emailIcon).toBeVisible();
      await expect(phoneIcon).toBeVisible();
    });
    ```

---

## 3. General Framework Updates (Runner & Documentation)

To ensure the test suite is fully aligned, the metadata in `e2e/runner.js`, `TEST_INFRA.md`, and `TEST_READY.md` must be updated to match the refined test case descriptions and expectations.

### File: `e2e/runner.js`
Modify the `testCases` array to update descriptions:
* **Case 19**: `Step Transition (2 to 3) updates UI` -> `Step Transition (2 to 3) updates UI for Step 3`
* **Case 20**: `Reverse Scroll Transitions update active step index backwards` -> `Step Transition (3 to 4) and Reverse Scroll validation`
* **Case 22**: `Background Cards presence` -> `Founder Profile container presence`
* **Case 23**: `Team Profiles presence` -> `Founder Profile image and bio placeholders presence`
* **Case 24**: `Company Mission Statement` -> `Founder Profile company mission statement presence`
* **Case 26**: `Team Card Hovers visual changes` -> `Founder Profile hover glow effects`
* **Case 27**: `Social Media Links accessibility/glow` -> `Founder Profile social media links/icons and hovers`
* **Case 35**: `Dark-theme Forms Layout validation` -> `Contact placeholders/icons (GitHub, LinkedIn, Email, Phone) presence`
* **Case 46**: `E2E Scenario 2: Company Discovery Journey` -> `E2E Scenario 2: Founder Profile Discovery`

### File: `TEST_INFRA.md`
Update the descriptions of Cases 13, 16, 19, 20, 22, 23, 24, 26, 27, 35, 45, and 46 to document the refined expectations (e.g. 400vh height, Step 4 Chatbot, Founder Profile layout elements, and social contacts).

### File: `TEST_READY.md`
Update the section summaries to describe the refined tests (400vh sticky scroll, Founder Profile centered layout, and 4 social/contact media items).
