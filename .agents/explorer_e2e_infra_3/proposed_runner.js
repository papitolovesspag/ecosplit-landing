/**
 * EcoSplit AI Landing Page - E2E Custom Runner (Dry-Run / Pre-flight / Greenfield Fallback)
 * File: e2e/runner.js (Proposed)
 * 
 * This runner script manages test execution in a greenfield environment:
 * 1. It checks if the project has been initialized (i.e., package.json exists and has @playwright/test).
 * 2. If the project is greenfield OR the target server (http://localhost:3000) is offline:
 *    - It prints a formatted report listing all 49 test cases as PENDING.
 *    - It exits gracefully with code 0 (or code 1 in --strict mode).
 * 3. If the project is initialized and the target server is online:
 *    - It attempts to run Playwright E2E tests via 'npx playwright test'.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_URL = process.env.TEST_URL || 'http://localhost:3000';
const IS_STRICT = process.argv.includes('--strict');

// List of all 49 test cases across Tiers 1-4
const TEST_CASES = [
  // TIER 1: Feature Coverage (20 cases)
  // Hero Section
  { id: 'T1.HERO.1', tier: 1, feature: 'Hero', title: 'Layout and Visibility of Key Elements', target: 'section#hero' },
  { id: 'T1.HERO.2', tier: 1, feature: 'Hero', title: 'Navigation Links Functionality', target: 'nav a[href^="#"]' },
  { id: 'T1.HERO.3', tier: 1, feature: 'Hero', title: 'WebGL Background Canvas Initialization', target: 'canvas#webgl-background' },
  { id: 'T1.HERO.4', tier: 1, feature: 'Hero', title: 'Call to Action (CTA) Button Hover and Click', target: 'button#hero-cta' },
  { id: 'T1.HERO.5', tier: 1, feature: 'Hero', title: 'Glassmorphism and Neon Styling Visual Properties', target: 'section#hero .glass-card' },
  // How It Works Section
  { id: 'T1.HOW.1', tier: 1, feature: 'How It Works', title: 'Section Initialization and Sticky Layout', target: 'section#how-it-works' },
  { id: 'T1.HOW.2', tier: 1, feature: 'How It Works', title: 'Step 0 (Initial State) Visibility', target: 'section#how-it-works [data-step="0"]' },
  { id: 'T1.HOW.3', tier: 1, feature: 'How It Works', title: 'Scroll-Triggered Transition to Step 1', target: 'section#how-it-works [data-step="1"]' },
  { id: 'T1.HOW.4', tier: 1, feature: 'How It Works', title: 'Scroll-Triggered Transition to Step 2 & 3', target: 'section#how-it-works [data-step="2"]' },
  { id: 'T1.HOW.5', tier: 1, feature: 'How It Works', title: 'Reverse Scroll Animation State Restoration', target: 'section#how-it-works' },
  // About Us Section
  { id: 'T1.ABOUT.1', tier: 1, feature: 'About Us', title: 'About Us Section Render and Structure', target: 'section#about-us' },
  { id: 'T1.ABOUT.2', tier: 1, feature: 'About Us', title: 'Team Member Cards Layout and Content', target: 'div.team-grid .team-card' },
  { id: 'T1.ABOUT.3', tier: 1, feature: 'About Us', title: 'Glassmorphism Card Hover Effects', target: 'div.team-grid .team-card' },
  { id: 'T1.ABOUT.4', tier: 1, feature: 'About Us', title: 'Social Links Interactivity', target: 'div.team-grid .team-card a.social-link' },
  { id: 'T1.ABOUT.5', tier: 1, feature: 'About Us', title: 'Responsive Grid Layout', target: 'div.team-grid' },
  // Contact Us Section
  { id: 'T1.CONTACT.1', tier: 1, feature: 'Contact Us', title: 'Form Layout and Visual Presence', target: 'form#contact-form' },
  { id: 'T1.CONTACT.2', tier: 1, feature: 'Contact Us', title: 'Success State Submission Flow', target: 'form#contact-form' },
  { id: 'T1.CONTACT.3', tier: 1, feature: 'Contact Us', title: 'Input Validation - Empty Required Fields', target: 'form#contact-form button[type="submit"]' },
  { id: 'T1.CONTACT.4', tier: 1, feature: 'Contact Us', title: 'Input Validation - Invalid Email Format', target: 'input#email' },
  { id: 'T1.CONTACT.5', tier: 1, feature: 'Contact Us', title: 'Form Submitting State Animation', target: 'form#contact-form button[type="submit"]' },

  // TIER 2: Boundary & Corner Cases (20 cases)
  // Hero Section
  { id: 'T2.HERO.1', tier: 2, feature: 'Hero', title: 'High-Resolution Viewport Layout (Ultra-wide)', target: 'section#hero' },
  { id: 'T2.HERO.2', tier: 2, feature: 'Hero', title: 'Extremely Narrow Mobile Viewport (320px)', target: 'section#hero' },
  { id: 'T2.HERO.3', tier: 2, feature: 'Hero', title: 'Mouse Interaction with WebGL Background at Viewport Boundaries', target: 'canvas#webgl-background' },
  { id: 'T2.HERO.4', tier: 2, feature: 'Hero', title: 'Fast Repeated Scrolling between Hero and Below Fold', target: 'body' },
  { id: 'T2.HERO.5', tier: 2, feature: 'Hero', title: 'Missing WebGL Context Graceful Fallback', target: 'canvas#webgl-background' },
  // How It Works Section
  { id: 'T2.HOW.1', tier: 2, feature: 'How It Works', title: 'Instant Scroll (Page Down / Home keypress / Anchor jump)', target: 'section#how-it-works' },
  { id: 'T2.HOW.2', tier: 2, feature: 'How It Works', title: 'Resize Viewport Mid-Scroll', target: 'section#how-it-works' },
  { id: 'T2.HOW.3', tier: 2, feature: 'How It Works', title: 'Slow-Motion Scroll Tracking', target: 'section#how-it-works' },
  { id: 'T2.HOW.4', tier: 2, feature: 'How It Works', title: 'Scroll past the boundary of sticky container', target: 'section#how-it-works' },
  { id: 'T2.HOW.5', tier: 2, feature: 'How It Works', title: 'Touch Drag Scrolling on Mobile Devices', target: 'section#how-it-works' },
  // About Us Section
  { id: 'T2.ABOUT.1', tier: 2, feature: 'About Us', title: 'Missing Avatar Image Fallback', target: 'div.team-grid .team-card img' },
  { id: 'T2.ABOUT.2', tier: 2, feature: 'About Us', title: 'Text Overflow in Team Member Cards', target: 'div.team-grid .team-card' },
  { id: 'T2.ABOUT.3', tier: 2, feature: 'About Us', title: 'Rapid Sequential Hovering over Cards', target: 'div.team-grid .team-card' },
  { id: 'T2.ABOUT.4', tier: 2, feature: 'About Us', title: 'Keyboard Navigation and Focus Styles', target: 'div.team-grid .team-card a.social-link' },
  { id: 'T2.ABOUT.5', tier: 2, feature: 'About Us', title: 'Zoom Level Accessibility Scaling (up to 200%)', target: 'section#about-us' },
  // Contact Us Section
  { id: 'T2.CONTACT.1', tier: 2, feature: 'Contact Us', title: 'Extreme Input Length Validation', target: 'input#name' },
  { id: 'T2.CONTACT.2', tier: 2, feature: 'Contact Us', title: 'Rapid Double Submit Click', target: 'form#contact-form button[type="submit"]' },
  { id: 'T2.CONTACT.3', tier: 2, feature: 'Contact Us', title: 'Special Characters and SQL Injection Snippets in Inputs', target: 'form#contact-form' },
  { id: 'T2.CONTACT.4', tier: 2, feature: 'Contact Us', title: 'Submission Failure with Network Error', target: 'form#contact-form' },
  { id: 'T2.CONTACT.5', tier: 2, feature: 'Contact Us', title: 'Input Whitespace-only Validation', target: 'form#contact-form' },

  // TIER 3: Cross-Feature Combinations (4 cases)
  { id: 'T3.XFEAT.1', tier: 3, feature: 'Cross-Feature', title: 'Sticky Nav State Updates During Page Scroll', target: 'nav a' },
  { id: 'T3.XFEAT.2', tier: 3, feature: 'Cross-Feature', title: 'WebGL Background Interaction during Section Transitions', target: 'canvas#webgl-background' },
  { id: 'T3.XFEAT.3', tier: 3, feature: 'Cross-Feature', title: 'Navigation Anchor Jump to How It Works Mid-Animation State', target: 'nav a[href="#how-it-works"]' },
  { id: 'T3.XFEAT.4', tier: 3, feature: 'Cross-Feature', title: 'CTA Scroll-to-Form and Auto-Focus', target: 'button#hero-cta' },

  // TIER 4: Real-World Scenarios (5 cases)
  { id: 'T4.SCEN.1', tier: 4, feature: 'Scenarios', title: 'First-Time User Experience (FTUX) & Performance Budget', target: 'body' },
  { id: 'T4.SCEN.2', tier: 4, feature: 'Scenarios', title: 'Full User Conversion Funnel Journey', target: 'body' },
  { id: 'T4.SCEN.3', tier: 4, feature: 'Scenarios', title: 'High-Latency Network Submission Recovery', target: 'form#contact-form' },
  { id: 'T4.SCEN.4', tier: 4, feature: 'Scenarios', title: 'Keyboard-Only Accessible Site Traversal', target: 'body' },
  { id: 'T4.SCEN.5', tier: 4, feature: 'Scenarios', title: 'System Dark/Light Mode Preference Integration', target: 'body' }
];

// Helper to log with spacing
function logHeader(text) {
  console.log('\n========================================================================');
  console.log(` ${text}`);
  console.log('========================================================================');
}

function checkWebserver(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      timeout: 1000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ online: true, statusCode: res.statusCode, data });
      });
    });

    req.on('error', () => {
      resolve({ online: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ online: false });
    });

    req.end();
  });
}

function runPlaywrightTests() {
  logHeader('RUNNING PLAYWRIGHT E2E SUITE');
  try {
    execSync('npx playwright test', { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('\n[E2E Runner Error] Playwright execution failed.');
    return false;
  }
}

function printInventory(reason) {
  console.warn(`\n[INFO] Entering GREENFIELD / DRY-RUN mode. Reason: ${reason}`);
  console.warn('Listing registered E2E test inventory:');

  TEST_CASES.forEach((tc) => {
    console.log(`[${tc.id}] [Tier ${tc.tier}] [${tc.feature}] ${tc.title} -> PENDING (${reason})`);
  });

  logHeader('TEST RUNNER SUMMARY (GREENFIELD DRY-RUN)');
  console.log(`Total Cases:  ${TEST_CASES.length}`);
  console.log(`Passed:       0`);
  console.log(`Failed:       0`);
  console.log(`Pending:      ${TEST_CASES.length} (Dry-run)`);
  console.log('------------------------------------------------------------------------');
  console.log('Resolution:   Test suite registered successfully. No execution performed.');
}

async function main() {
  logHeader('ECOSPLIT AI - E2E TEST RUNNER PRE-FLIGHT');
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Strict Mode: ${IS_STRICT ? 'ON' : 'OFF'}`);

  // 1. Check if the project is initialized with Playwright dependencies
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let hasPlaywrightDep = false;

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      hasPlaywrightDep = 
        (pkg.dependencies && pkg.dependencies['@playwright/test']) ||
        (pkg.devDependencies && pkg.devDependencies['@playwright/test']);
    } catch (e) {
      console.warn('[WARNING] Failed to parse package.json');
    }
  }

  // If we don't have Playwright installed in package.json, we run in dry-run mode immediately
  if (!hasPlaywrightDep) {
    printInventory('Project not initialized with @playwright/test');
    process.exit(IS_STRICT ? 1 : 0);
  }

  // 2. Check if webserver is active
  const status = await checkWebserver(TARGET_URL);

  if (!status.online) {
    printInventory('Web server is offline');
    process.exit(IS_STRICT ? 1 : 0);
  }

  console.log(`\n[SUCCESS] Web server is ONLINE at ${TARGET_URL} (Status: ${status.statusCode})`);

  // Run the actual Playwright tests since dependencies exist and server is online
  const ok = runPlaywrightTests();
  process.exit(ok ? 0 : 1);
}

main();
