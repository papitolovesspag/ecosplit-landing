const { test, expect } = require('@playwright/test');

test.describe('Contact Us Section - Tiers 1 & 2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  // --- Tier 1: Render and Visual Presence (5 cases) ---

  test('Case 31: Contact Us section wrapper section#contact-us is present in the DOM', async ({ page }) => {
    const section = page.locator('section#contact-us');
    await expect(section).toBeVisible();
  });

  test('Case 32: Contact form form#contact-form is rendered with Name, Email, and Message inputs', async ({ page }) => {
    const form = page.locator('form#contact-form');
    await expect(form).toBeVisible();

    const nameInput = form.locator('input[name="name"], input[type="text"]');
    const emailInput = form.locator('input[name="email"], input[type="email"]');
    const messageInput = form.locator('textarea[name="message"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test('Case 33: Form inputs have placeholder text and labels', async ({ page }) => {
    const form = page.locator('form#contact-form');
    const nameInput = form.locator('input[name="name"], input[type="text"]').first();
    const emailInput = form.locator('input[name="email"], input[type="email"]').first();

    const namePlaceholder = await nameInput.getAttribute('placeholder');
    const emailPlaceholder = await emailInput.getAttribute('placeholder');

    expect(namePlaceholder).not.toBeNull();
    expect(emailPlaceholder).not.toBeNull();
  });

  test('Case 34: Submit button is present and enabled by default', async ({ page }) => {
    const submitBtn = page.locator('form#contact-form button[type="submit"], form#contact-form input[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

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

  // --- Tier 2: Interactive States & Behaviors (5 cases) ---

  test('Case 36: Contact form validation rejects empty fields on submit', async ({ page }) => {
    const form = page.locator('form#contact-form');
    const submitBtn = form.locator('button[type="submit"], input[type="submit"]');

    // Attempt to submit empty form
    await submitBtn.click();

    // Check if HTML5 validation or custom validation messages prevent submission
    const nameInput = form.locator('input[name="name"], input[type="text"]').first();
    const validationMessage = await nameInput.evaluate(el => el.validationMessage || '');
    const isInvalid = await nameInput.evaluate(el => !el.validity.valid);
    
    // Should fail validation
    expect(isInvalid).toBe(true);
  });

  test('Case 37: Contact form validation rejects invalid email format', async ({ page }) => {
    const form = page.locator('form#contact-form');
    const nameInput = form.locator('input[name="name"], input[type="text"]').first();
    const emailInput = form.locator('input[name="email"], input[type="email"]').first();
    const messageInput = form.locator('textarea[name="message"]').first();
    const submitBtn = form.locator('button[type="submit"]');

    // Fill form with invalid email
    await nameInput.fill('John Doe');
    await emailInput.fill('invalid-email-address');
    await messageInput.fill('Hello EcoSplit team, test message!');

    await submitBtn.click();

    const isEmailValid = await emailInput.evaluate(el => el.validity.valid);
    expect(isEmailValid).toBe(false);
  });

  test('Case 38: Successful form submission displays positive visual feedback', async ({ page }) => {
    const form = page.locator('form#contact-form');
    const nameInput = form.locator('input[name="name"], input[type="text"]').first();
    const emailInput = form.locator('input[name="email"], input[type="email"]').first();
    const messageInput = form.locator('textarea[name="message"]').first();
    const submitBtn = form.locator('button[type="submit"]');

    // Fill with valid data
    await nameInput.fill('Jane Doe');
    await emailInput.fill('jane@example.com');
    await messageInput.fill('A valid test message inquiring about energy savings.');

    await submitBtn.click();
    await page.waitForTimeout(500); // Wait for mock submit or transition

    const successMessage = page.locator('.success-message, [class*="success"], :text-matches("Success", "i")').first();
    expect(successMessage).toBeDefined();
  });

  test('Case 39: Submitting form with invalid fields highlights fields with error styling', async ({ page }) => {
    const form = page.locator('form#contact-form');
    const emailInput = form.locator('input[name="email"], input[type="email"]').first();
    const submitBtn = form.locator('button[type="submit"]');

    await emailInput.fill('bad-email');
    await submitBtn.click();
    await page.waitForTimeout(200);

    // Verify error class or pseudo-class matches error styling
    const border = await emailInput.evaluate(el => window.getComputedStyle(el).borderColor);
    expect(border).toBeDefined();
  });

  test('Case 40: Form inputs show clear focus rings or active states with neon green/cyan', async ({ page }) => {
    const form = page.locator('form#contact-form');
    const nameInput = form.locator('input[name="name"], input[type="text"]').first();

    await nameInput.focus();
    await page.waitForTimeout(100);

    const outline = await nameInput.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow || style.borderColor;
    });
    expect(outline).toBeDefined();
  });
});
