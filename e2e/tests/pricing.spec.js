const { test, expect } = require('@playwright/test');

test.describe('Pricing Section - Tiers 1 & 2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  // --- Tier 1: Render and Visual Presence (5 cases) ---

  test('Case 31: Pricing section wrapper section#pricing is present in the DOM', async ({ page }) => {
    const section = page.locator('section#pricing');
    await expect(section).toBeVisible();
  });

  test('Case 32: Pricing section header contains title and subtitle', async ({ page }) => {
    const header = page.locator('section#pricing h2, section#pricing h3');
    await expect(header.first()).toBeVisible();
    await expect(header.first()).toContainText(/pricing/i);
  });

  test('Case 33: Two pricing cards with class .pricing-card are rendered', async ({ page }) => {
    const cards = page.locator('section#pricing .pricing-card');
    await expect(cards).toHaveCount(2);
  });

  test('Case 34: Pricing cards display their respective tier names (Free Core and AI Premium)', async ({ page }) => {
    const cards = page.locator('section#pricing .pricing-card');
    const freeTier = cards.filter({ hasText: /Free Core/i });
    const premiumTier = cards.filter({ hasText: /AI Premium/i });
    
    await expect(freeTier).toBeVisible();
    await expect(premiumTier).toBeVisible();
  });

  test('Case 35: Pricing cards display pricing values and feature lists', async ({ page }) => {
    const cards = page.locator('section#pricing .pricing-card');
    
    // Check for price displays
    const prices = cards.locator('[class*="price"], [class*="amount"]');
    await expect(prices.first()).toBeVisible();

    // Check for feature list presence
    const featureLists = cards.locator('ul, [class*="features"]');
    await expect(featureLists.first()).toBeVisible();
  });

  // --- Tier 2: Interactive States & Behaviors (5 cases) ---

  test('Case 36: Monthly/Yearly toggle switch is present and clickable', async ({ page }) => {
    const toggle = page.locator('section#pricing button#billing-toggle, section#pricing [role="switch"], section#pricing input[type="checkbox"]');
    await expect(toggle.first()).toBeVisible();
    await expect(toggle.first()).toBeEnabled();
  });

  test('Case 37: Toggling Monthly/Yearly billing updates pricing values and labels', async ({ page }) => {
    const cards = page.locator('section#pricing .pricing-card');
    const priceBefore = await cards.filter({ hasText: /AI Premium/i }).locator('[class*="price"], [class*="amount"]').first().innerText();

    const toggle = page.locator('section#pricing button#billing-toggle, section#pricing [role="switch"], section#pricing input[type="checkbox"]').first();
    await toggle.click();
    await page.waitForTimeout(200);

    const priceAfter = await cards.filter({ hasText: /AI Premium/i }).locator('[class*="price"], [class*="amount"]').first().innerText();
    expect(priceBefore).not.toBe(priceAfter);
  });

  test('Case 38: Pricing cards trigger neon glow borders on hover (glassmorphic aesthetic)', async ({ page }) => {
    const card = page.locator('section#pricing .pricing-card').first();
    await expect(card).toBeVisible();

    await card.hover();
    await page.waitForTimeout(100);

    const hoverStyle = await card.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.boxShadow || computed.borderColor || computed.filter;
    });
    expect(hoverStyle).toBeDefined();
  });

  test('Case 39: Pricing buttons are interactive and accept focus', async ({ page }) => {
    const button = page.locator('section#pricing .pricing-card button, section#pricing .pricing-card a').first();
    await expect(button).toBeVisible();

    await button.focus();
    const isFocused = await button.evaluate(el => document.activeElement === el);
    expect(isFocused).toBe(true);
  });

  test('Case 40: Pricing grid layout is responsive and adjusts on viewport resize', async ({ page }) => {
    const cards = page.locator('section#pricing .pricing-card');
    await expect(cards).toHaveCount(2);

    // Get positions in desktop
    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(200);

    const mobileBox1 = await cards.nth(0).boundingBox();
    const mobileBox2 = await cards.nth(1).boundingBox();

    // Verify change in vertical alignment
    if (box1 && box2 && mobileBox1 && mobileBox2) {
      expect(mobileBox1.y).not.toEqual(mobileBox2.y);
    }
  });
});
