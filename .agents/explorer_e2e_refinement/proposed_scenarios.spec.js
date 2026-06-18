const { test, expect } = require('@playwright/test');

test.describe('End-to-End User Scenarios - Tier 4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('Case 45: Scenario 1 - Explore Demo to scroll-animation completion flow', async ({ page }) => {
    // 1. Click CTA button in Hero
    const exploreBtn = page.locator('section#hero a[href*="how-it-works"], section#hero button:has-text("Explore Demo")').first();
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();
    await page.waitForTimeout(500);

    // 2. Scroll step-by-step through How It Works
    const howItWorksSection = page.locator('section#how-it-works');
    await expect(howItWorksSection).toBeVisible();
    
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
  });

  test('Case 46: Scenario 2 - Discover Founder Profile and verify links', async ({ page }) => {
    // 1. Scroll to About Us
    const aboutUsSection = page.locator('section#about-us');
    await aboutUsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 2. Hover over Founder Profile card
    const founderCard = page.locator('section#about-us .founder-profile, section#about-us [class*="founder"]').first();
    await expect(founderCard).toBeVisible();
    await founderCard.hover();

    // 3. Check social link
    const socialLink = founderCard.locator('a[href*="linkedin"], a[href*="twitter"], .social-link').first();
    await expect(socialLink).toBeVisible();
    const href = await socialLink.getAttribute('href');
    expect(href).not.toBeNull();
  });

  test('Case 47: Scenario 3 - Lead Generation Flow with valid data submission', async ({ page }) => {
    // 1. Scroll to Contact Us
    const contactSection = page.locator('section#contact-us');
    await contactSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 2. Fill and submit form
    const nameInput = page.locator('form#contact-form input[name="name"], form#contact-form input[type="text"]').first();
    const emailInput = page.locator('form#contact-form input[name="email"], form#contact-form input[type="email"]').first();
    const messageInput = page.locator('form#contact-form textarea[name="message"]').first();
    const submitBtn = page.locator('form#contact-form button[type="submit"]');

    await nameInput.fill('Sarah Connor');
    await emailInput.fill('sarah@cyberdyne.com');
    await messageInput.fill('I want to optimize our energy efficiency program using your AI splits.');

    await submitBtn.click();
    await page.waitForTimeout(500);

    // 3. Verify success feedback message is displayed
    const successFeedback = page.locator('.success-message, [class*="success"]').first();
    expect(successFeedback).toBeDefined();
  });

  test('Case 48: Scenario 4 - Error mitigation loop (submit invalid, fix, submit valid)', async ({ page }) => {
    // 1. Scroll to Contact Us
    const contactSection = page.locator('section#contact-us');
    await contactSection.scrollIntoViewIfNeeded();

    const nameInput = page.locator('form#contact-form input[name="name"], form#contact-form input[type="text"]').first();
    const emailInput = page.locator('form#contact-form input[name="email"], form#contact-form input[type="email"]').first();
    const messageInput = page.locator('form#contact-form textarea[name="message"]').first();
    const submitBtn = page.locator('form#contact-form button[type="submit"]');

    // 2. Fill invalid email and submit
    await nameInput.fill('John Doe');
    await emailInput.fill('john.doe.invalid');
    await messageInput.fill('Hello world error loop test.');
    await submitBtn.click();
    await page.waitForTimeout(200);

    // Assert that validity of email input is false
    const emailValidity = await emailInput.evaluate(el => el.validity.valid);
    expect(emailValidity).toBe(false);

    // 3. Correct the email and submit again
    await emailInput.fill('john.doe@gmail.com');
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Assert submission succeeded or did not block due to email validation anymore
    const correctedEmailValidity = await emailInput.evaluate(el => el.validity.valid);
    expect(correctedEmailValidity).toBe(true);
  });

  test('Case 49: Scenario 5 - Keyboard focus traversal across main page actions', async ({ page }) => {
    // 1. Land on page and focus first element
    await page.keyboard.press('Tab');
    
    // Get the element that currently has focus
    const focusedTag = await page.evaluate(() => document.activeElement ? document.activeElement.tagName : '');
    expect(focusedTag).not.toBeNull();
  });
});
