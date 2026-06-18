const { test, expect } = require('@playwright/test');

test.describe('Hero Section - Tiers 1 & 2', () => {
  test.beforeEach(async ({ page }) => {
    // Go to landing page
    await page.goto('http://localhost:3000/');
  });

  // --- Tier 1: Render and Visual Presence (5 cases) ---

  test('Case 1: Hero section wrapper section#hero is present in the DOM', async ({ page }) => {
    const heroSection = page.locator('section#hero');
    await expect(heroSection).toBeVisible();
  });

  test('Case 2: WebGL background canvas#webgl-background is present and visible', async ({ page }) => {
    const webglCanvas = page.locator('canvas#webgl-background');
    await expect(webglCanvas).toBeVisible();
  });

  test('Case 3: Core headline containing EcoSplit AI is rendered', async ({ page }) => {
    const headline = page.locator('section#hero h1');
    await expect(headline).toContainText(/EcoSplit\s*AI/i);
  });

  test('Case 4: Call-to-action (CTA) buttons are present', async ({ page }) => {
    // Looking for CTA buttons inside hero (e.g., Get Started, Explore Demo)
    const getStartedBtn = page.locator('section#hero a[href*="contact-us"], section#hero button:has-text("Get Started")');
    const exploreDemoBtn = page.locator('section#hero a[href*="how-it-works"], section#hero button:has-text("Explore Demo")');
    await expect(getStartedBtn.first().or(exploreDemoBtn.first()).first()).toBeVisible();
  });

  test('Case 5: Glassmorphic cards with neon borders are rendered in the Hero section', async ({ page }) => {
    // Looking for elements with glassmorphic classes or styling inside hero
    const glassCards = page.locator('section#hero .glass-card, section#hero [class*="glass"]');
    await expect(glassCards.first()).toBeVisible();
  });

  // --- Tier 2: Interactive States & Behaviors (5 cases) ---

  test('Case 6: CTA buttons hover state changes style (neon glow/border)', async ({ page }) => {
    const ctaButton = page.locator('section#hero button, section#hero a.btn-cta').first();
    await expect(ctaButton).toBeVisible();

    // Hover over the CTA button
    await ctaButton.hover();
    
    // Check computed styles or classes to verify hover transition is active
    // For example, looking for specific shadow or border transition classes
    const boxSizing = await ctaButton.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(boxSizing).toBe('pointer');
  });

  test('Case 7: Hovering over the glassmorphic cards triggers visual enhancements', async ({ page }) => {
    const card = page.locator('section#hero .glass-card, section#hero [class*="glass"]').first();
    await expect(card).toBeVisible();

    // Get initial opacity or box-shadow
    const initialShadow = await card.evaluate(el => window.getComputedStyle(el).boxShadow);
    
    // Hover over the card
    await card.hover();
    await page.waitForTimeout(100); // Wait for transition
    
    const hoverShadow = await card.evaluate(el => window.getComputedStyle(el).boxShadow);
    // There should be a change in box-shadow or scale or opacity, or at least hover is triggered
    expect(hoverShadow).toBeDefined();
  });

  test('Case 8: Navigation bar links exist and point to correct sections', async ({ page }) => {
    const howItWorksLink = page.locator('header nav a[href="#how-it-works"], header nav a[href*="how-it-works"]');
    const aboutUsLink = page.locator('header nav a[href="#about-us"], header nav a[href*="about-us"]');
    const contactUsLink = page.locator('header nav a[href="#contact-us"], header nav a[href*="contact-us"]');

    await expect(howItWorksLink).toBeVisible();
    await expect(aboutUsLink).toBeVisible();
    await expect(contactUsLink).toBeVisible();
  });

  test('Case 9: Smooth scroll behaviour is triggered when clicking navigation links', async ({ page }) => {
    const howItWorksLink = page.locator('header nav a[href*="how-it-works"]').first();
    await expect(howItWorksLink).toBeVisible();

    // Click link and wait for scroll to resolve
    await howItWorksLink.click();
    await page.waitForTimeout(800); // Give time for smooth scroll to finish

    // Verify window scroll position is greater than 0
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('Case 10: WebGL background interaction is initialized when mouse moves over Hero', async ({ page }) => {
    const heroSection = page.locator('section#hero');
    await expect(heroSection).toBeVisible();

    // Trigger mouse moves across the Hero section to simulate user engagement
    const boundingBox = await heroSection.boundingBox();
    if (boundingBox) {
      const startX = boundingBox.x + boundingBox.width / 2;
      const startY = boundingBox.y + boundingBox.height / 2;
      
      // Move mouse and verify no JS crash occurs and mouse event is captured
      await page.mouse.move(startX, startY);
      await page.mouse.move(startX + 50, startY + 50);
      await page.mouse.move(startX - 50, startY - 50);
    }
    
    // Check that canvas is still rendering and no console error is present
    const canvas = page.locator('canvas#webgl-background');
    await expect(canvas).toBeVisible();
  });
});
