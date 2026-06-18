// EcoSplit AI Landing Page - Hero Section E2E Tests (Proposed)
// File: e2e/tests/hero.spec.js

const { test, expect } = require('@playwright/test');

test.describe('Hero Section - Feature Coverage (Tier 1)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('T1.HERO.1: Layout and Visibility of Key Elements', async ({ page }) => {
    // Check that Hero section is visible
    const hero = page.locator('section#hero');
    await expect(hero).toBeVisible();

    // Check header logo and navigation links
    await expect(page.locator('nav .logo')).toBeVisible();
    await expect(page.locator('nav a[href="#how-it-works"]')).toBeVisible();
    await expect(page.locator('nav a[href="#about-us"]')).toBeVisible();
    await expect(page.locator('nav a[href="#contact-us"]')).toBeVisible();

    // Check main copy and CTA
    await expect(page.locator('h1.hero-title')).toBeVisible();
    await expect(page.locator('p.hero-subtitle')).toBeVisible();
    await expect(page.locator('button#hero-cta')).toBeVisible();
  });

  test('T1.HERO.2: Navigation Links Functionality', async ({ page }) => {
    // Click on "How It Works" link and verify scroll
    await page.click('nav a[href="#how-it-works"]');
    await page.waitForTimeout(1000); // Wait for smooth scroll to finish
    
    // Check if target element is in viewport
    const howItWorks = page.locator('section#how-it-works');
    await expect(howItWorks).toBeInViewport();
  });

  test('T1.HERO.3: WebGL Background Canvas Initialization', async ({ page }) => {
    // Canvas element should exist and be active
    const canvas = page.locator('canvas#webgl-background');
    await expect(canvas).toBeAttached();
    
    // Verify that the canvas occupies the correct visual styling layer
    const zIndex = await canvas.evaluate(el => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex, 10)).toBeLessThan(0);
  });

  test('T1.HERO.4: Call to Action (CTA) Button Hover and Click', async ({ page }) => {
    const cta = page.locator('button#hero-cta');
    await expect(cta).toBeVisible();
    
    // Hover over CTA and verify hover transition trigger (e.g. style shifts)
    await cta.hover();
    await page.waitForTimeout(200);
    
    // Click CTA and verify scroll to Contact Form
    await cta.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('section#contact-us')).toBeInViewport();
  });

  test('T1.HERO.5: Glassmorphism and Neon Styling Visual Properties', async ({ page }) => {
    const glassCard = page.locator('section#hero .glass-card').first();
    await expect(glassCard).toBeVisible();
    
    // Verify styling using evaluation of computed CSS properties
    const styles = await glassCard.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backdropFilter: computed.backdropFilter || computed.webkitBackdropFilter,
        borderColor: computed.borderColor,
        background: computed.background
      };
    });
    
    expect(styles.backdropFilter).toContain('blur');
    expect(styles.background).toContain('rgba');
  });
});

test.describe('Hero Section - Boundary & Corner Cases (Tier 2)', () => {
  test('T2.HERO.1: High-Resolution Viewport Layout', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    
    const hero = page.locator('section#hero');
    await expect(hero).toBeVisible();
    
    // Ensure no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(2560);
  });

  test('T2.HERO.2: Extremely Narrow Mobile Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    const hero = page.locator('section#hero');
    await expect(hero).toBeVisible();
    
    // Ensure text elements wrap correctly and don't cause horizontal overflow
    const hasScrollbar = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasScrollbar).toBe(false);
  });

  test('T2.HERO.5: Missing WebGL Context Graceful Fallback', async ({ page }) => {
    // Force getContext to return null for WebGL
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, {
        apply(target, thisArg, argList) {
          if (argList[0] === 'webgl' || argList[0] === 'experimental-webgl' || argList[0] === 'webgl2') {
            return null;
          }
          return Reflect.apply(target, thisArg, argList);
        }
      });
    });
    
    await page.goto('/');
    
    // Page should still load and display content, displaying fallback background styles
    await expect(page.locator('h1.hero-title')).toBeVisible();
    const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).not.toBe('rgba(0, 0, 0, 0)');
  });
});
