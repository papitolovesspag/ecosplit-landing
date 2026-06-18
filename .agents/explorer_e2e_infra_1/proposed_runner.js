/**
 * EcoSplit AI - Greenfield E2E Test Runner Wrapper
 * This script runs the E2E test suite. 
 * If the Next.js local server is not running on port 3000, it fails gracefully by listing all test cases as failed/pending.
 * If the server is running, it will invoke Playwright to run the actual browser-based test suite.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = `http://localhost:${PORT}`;

// Colors for terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const testCases = [
  // TIER 1: FEATURE COVERAGE (20 test cases)
  // Hero Section
  { id: 'Hero.1', tier: 'Tier 1: Feature Coverage', feature: 'Hero', name: 'Title & Tagline Visibility', description: 'Verify that the main H1 heading "EcoSplit AI" and tagline are visible in the viewport.' },
  { id: 'Hero.2', tier: 'Tier 1: Feature Coverage', feature: 'Hero', name: 'CTA Navigation', description: 'Verify that clicking the primary CTA smooth-scrolls to the How It Works section.' },
  { id: 'Hero.3', tier: 'Tier 1: Feature Coverage', feature: 'Hero', name: 'WebGL Background Presence', description: 'Verify that the Three.js background canvas is present in the DOM.' },
  { id: 'Hero.4', tier: 'Tier 1: Feature Coverage', feature: 'Hero', name: 'Glassmorphic Cards Rendered', description: 'Verify that glassmorphic cards with neon borders exist in the Hero area.' },
  { id: 'Hero.5', tier: 'Tier 1: Feature Coverage', feature: 'Hero', name: 'Navbar Links & Routing', description: 'Verify that navbar section links update the page URL hash correctly.' },

  // How It Works Section
  { id: 'HowItWorks.1', tier: 'Tier 1: Feature Coverage', feature: 'How It Works', name: 'Sticky Container Height', description: 'Verify that the scroll animation container has sticky positioning and sufficient scroll height (e.g. 300vh).' },
  { id: 'HowItWorks.2', tier: 'Tier 1: Feature Coverage', feature: 'How It Works', name: 'Scroll Step 1 Transition', description: 'Verify that scrolling to Step 1 renders the correct title and graphic state.' },
  { id: 'HowItWorks.3', tier: 'Tier 1: Feature Coverage', feature: 'How It Works', name: 'Scroll Step 2 Transition', description: 'Verify that scrolling to Step 2 dynamically updates the illustration and text content.' },
  { id: 'HowItWorks.4', tier: 'Tier 1: Feature Coverage', feature: 'How It Works', name: 'Scroll Step 3 Transition', description: 'Verify that scrolling to Step 3 displays the final cost-optimization view.' },
  { id: 'HowItWorks.5', tier: 'Tier 1: Feature Coverage', feature: 'How It Works', name: 'Step Indicator Interactivity', description: 'Verify that clicking bullet indicators jumps the scroll viewport to the corresponding step.' },

  // About Us Section
  { id: 'AboutUs.1', tier: 'Tier 1: Feature Coverage', feature: 'About Us', name: 'Team Profile Cards Rendered', description: 'Verify that team profiles or mission statements are displayed in a responsive grid.' },
  { id: 'AboutUs.2', tier: 'Tier 1: Feature Coverage', feature: 'About Us', name: 'Neon Hover Effects', description: 'Verify that hovering over profiles triggers neon border glowing CSS animations.' },
  { id: 'AboutUs.3', tier: 'Tier 1: Feature Coverage', feature: 'About Us', name: 'Tech Stack/Mission Content', description: 'Verify that company mission text is readable and correctly rendered.' },
  { id: 'AboutUs.4', tier: 'Tier 1: Feature Coverage', feature: 'About Us', name: 'Layout Responsiveness', description: 'Verify that the team grid reflows columns based on viewport breakpoints.' },
  { id: 'AboutUs.5', tier: 'Tier 1: Feature Coverage', feature: 'About Us', name: 'Social Links Functional', description: 'Verify that team member social icons link to external profiles with secure attributes.' },

  // Contact Us Section
  { id: 'ContactUs.1', tier: 'Tier 1: Feature Coverage', feature: 'Contact Us', name: 'Form Inputs Rendered', description: 'Verify that Name, Email, Subject, Message, and Submit elements exist.' },
  { id: 'ContactUs.2', tier: 'Tier 1: Feature Coverage', feature: 'Contact Us', name: 'Visual Validation Errors', description: 'Verify that invalid/missing fields highlight in red and show error messages on submit.' },
  { id: 'ContactUs.3', tier: 'Tier 1: Feature Coverage', feature: 'Contact Us', name: 'Form Submission Success', description: 'Verify that valid form inputs display a success message and clear form fields.' },
  { id: 'ContactUs.4', tier: 'Tier 1: Feature Coverage', feature: 'Contact Us', name: 'Glassmorphic Focus Styling', description: 'Verify that focusing an input updates its styling to active glassmorphism with neon highlight.' },
  { id: 'ContactUs.5', tier: 'Tier 1: Feature Coverage', feature: 'Contact Us', name: 'Input Character Counter/Limits', description: 'Verify that character limits on text areas are visually displayed and enforced.' },

  // TIER 2: BOUNDARY AND CORNER CASES (20 test cases)
  // Hero Section
  { id: 'Hero.B1', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Hero', name: 'Ultra-wide Viewport Scaling', description: 'Verify layout integrity and canvas responsiveness at viewports > 2560px.' },
  { id: 'Hero.B2', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Hero', name: 'Mobile Landscape Aspect Ratio', description: 'Verify that low-height, wide viewports do not cause layout overlaps or hidden elements.' },
  { id: 'Hero.B3', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Hero', name: 'WebGL Context Loss Graceful Fallback', description: 'Verify that canvas context loss reverts gracefully to a CSS gradient without breaking page load.' },
  { id: 'Hero.B4', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Hero', name: 'Slow Network Background Fallback', description: 'Verify that the page remains readable and usable even if Three.js scripts take > 5s to load.' },
  { id: 'Hero.B5', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Hero', name: 'Custom Font Load Fail Fallback', description: 'Verify that font fallback configurations prevent layout shifts (CLS) if custom fonts fail.' },

  // How It Works Section
  { id: 'HowItWorks.B1', tier: 'Tier 2: Boundary & Corner Cases', feature: 'How It Works', name: 'Rapid Scroll Jitter Stability', description: 'Verify that extreme rapid scrolling up/down does not cause visual glitching or state lock.' },
  { id: 'HowItWorks.B2', tier: 'Tier 2: Boundary & Corner Cases', feature: 'How It Works', name: 'Mid-scroll Reload Initialization', description: 'Verify that reloading the page at 50% scroll height initializes the animation at the correct step.' },
  { id: 'HowItWorks.B3', tier: 'Tier 2: Boundary & Corner Cases', feature: 'How It Works', name: 'Input Device Scroll Support', description: 'Verify scroll tracking for trackpads, inertia scrolling, mouse wheels, and keyboard navigation.' },
  { id: 'HowItWorks.B4', tier: 'Tier 2: Boundary & Corner Cases', feature: 'How It Works', name: 'Extreme Low-Height Viewports', description: 'Verify that the sticky container does not clip content at vertical viewports < 400px.' },
  { id: 'HowItWorks.B5', tier: 'Tier 2: Boundary & Corner Cases', feature: 'How It Works', name: 'Mobile Touch Scroll Sensitivity', description: 'Verify touch swipe responsiveness and frame transition thresholds on mobile devices.' },

  // About Us Section
  { id: 'AboutUs.B1', tier: 'Tier 2: Boundary & Corner Cases', feature: 'About Us', name: 'Long Text Bio Expansion', description: 'Verify that long names or bios do not overflow boundaries or overlap other team cards.' },
  { id: 'AboutUs.B2', tier: 'Tier 2: Boundary & Corner Cases', feature: 'About Us', name: 'WCAG Contrast Compliancy', description: 'Verify that text overlaying glassmorphic backgrounds meets 4.5:1 minimum contrast.' },
  { id: 'AboutUs.B3', tier: 'Tier 2: Boundary & Corner Cases', feature: 'About Us', name: 'Avatar Image Load Failure Fallback', description: 'Verify that stylized SVGs or initial placeholders render if avatar image URLs fail.' },
  { id: 'AboutUs.B4', tier: 'Tier 2: Boundary & Corner Cases', feature: 'About Us', name: 'Keyboard Focus Rings Visibility', description: 'Verify that tabbing onto interactive profile elements renders visible focus rings.' },
  { id: 'AboutUs.B5', tier: 'Tier 2: Boundary & Corner Cases', feature: 'About Us', name: 'High-frequency Hover Stress Test', description: 'Verify that rapid mouse-over and mouse-out triggers do not queue infinite animation loops.' },

  // Contact Us Section
  { id: 'ContactUs.B1', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Contact Us', name: 'SQL/Script Injection Sanitization', description: 'Verify that input fields sanitize HTML tags, scripts, and SQL symbols before state updates.' },
  { id: 'ContactUs.B2', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Contact Us', name: 'Extreme Length Text Paste', description: 'Verify that pasting > 10,000 characters into message displays a validation warning and blocks submit.' },
  { id: 'ContactUs.B3', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Contact Us', name: 'Form Double-Submit Prevention', description: 'Verify that clicking submit repeatedly triggers only one action and disables the button.' },
  { id: 'ContactUs.B4', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Contact Us', name: 'Complex/Malformed Email Rejection', description: 'Verify validation handles extreme invalid emails (e.g. spaces, multiple @, leading/trailing dots).' },
  { id: 'ContactUs.B5', tier: 'Tier 2: Boundary & Corner Cases', feature: 'Contact Us', name: 'Submission Network Timeout Fallback', description: 'Verify a timeout error message displays if the submit request takes > 10s, keeping user inputs.' },

  // TIER 3: CROSS-FEATURE COMBINATIONS (4 test cases)
  { id: 'Cross.1', tier: 'Tier 3: Cross-Feature Combinations', feature: 'Cross-Feature', name: 'Active Nav Link State Sync', description: 'Verify that scrolling updates the active section link highlighted in the global navbar.' },
  { id: 'Cross.2', tier: 'Tier 3: Cross-Feature Combinations', feature: 'Cross-Feature', name: 'Page Scroll to WebGL Speed Sync', description: 'Verify that scroll speed/direction changes WebGL particle dynamics (velocity/rotation).' },
  { id: 'Cross.3', tier: 'Tier 3: Cross-Feature Combinations', feature: 'Cross-Feature', name: 'Hero CTA Scroll and Animation Start', description: 'Verify that Hero CTA click scrolls to How It Works and immediately activates the entry animation.' },
  { id: 'Cross.4', tier: 'Tier 3: Cross-Feature Combinations', feature: 'Cross-Feature', name: 'Sequential Tab Focus Traversal', description: 'Verify logical tab order from Navbar to Hero, About Us, and Contact Form.' },

  // TIER 4: REAL-WORLD SCENARIOS (5 test cases)
  { id: 'Scenario.1', tier: 'Tier 4: Real-world Scenarios', feature: 'End-to-End Journey', name: 'First-time Visitor Conversion Path', description: 'Simulate a complete user path from initial landing, reading all sections, to form submission.' },
  { id: 'Scenario.2', tier: 'Tier 4: Real-world Scenarios', feature: 'End-to-End Journey', name: 'Mobile Cellular Network Session', description: 'Simulate a mobile phone user navigating the page on a high-latency connection.' },
  { id: 'Scenario.3', tier: 'Tier 4: Real-world Scenarios', feature: 'End-to-End Journey', name: 'Investor Research & Link Out Session', description: 'Simulate rapid scroll down, clicking multiple team members profiles, and scrolling back up.' },
  { id: 'Scenario.4', tier: 'Tier 4: Real-world Scenarios', feature: 'End-to-End Journey', name: 'Screen Reader Navigation Auditing', description: 'Verify screen reader accessibility, aria tags, labels, and semantic document outline.' },
  { id: 'Scenario.5', tier: 'Tier 4: Real-world Scenarios', feature: 'End-to-End Journey', name: 'Lighthouse Performance & CLS Emulation', description: 'Verify zero layout shifts and high visual stability during rendering and background init.' }
];

console.log(`${BOLD}${CYAN}========================================================================${RESET}`);
console.log(`${BOLD}${CYAN}           EcoSplit AI - E2E Testing Infrastructure Runner              ${RESET}`);
console.log(`${BOLD}${CYAN}========================================================================${RESET}\n`);

// Check if Next.js local server is reachable on port 3000
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.request({ host: 'localhost', port: PORT, path: '/', timeout: 1500 }, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
};

const runGracefulGreenfieldFail = () => {
  console.log(`${BOLD}${YELLOW}[WARNING] Local server is not running on ${HOST}${RESET}`);
  console.log(`${YELLOW}Executing in Greenfield Validation (Dry-Run) mode.\n${RESET}`);

  let currentTier = '';
  testCases.forEach((tc) => {
    if (tc.tier !== currentTier) {
      currentTier = tc.tier;
      console.log(`\n${BOLD}${CYAN}--- ${currentTier} ---${RESET}`);
    }
    console.log(`${RED}✗ [FAIL] ${tc.id}: ${tc.name} ${RESET}`);
    console.log(`         Reason: Website not implemented / server offline`);
    console.log(`         Details: ${tc.description}`);
  });

  console.log(`\n${BOLD}${CYAN}========================================================================${RESET}`);
  console.log(`${BOLD}Test Run Summary:${RESET}`);
  console.log(`  Total Test Cases Checked: ${BOLD}${testCases.length}${RESET}`);
  console.log(`  Passed:                   ${GREEN}0${RESET}`);
  console.log(`  Failed:                   ${RED}${testCases.length}${RESET}`);
  console.log(`${BOLD}${CYAN}========================================================================${RESET}`);
  console.log(`${RED}Graceful Failure: E2E infrastructure verified but application code is not yet present.${RESET}`);
  
  process.exit(1); // Return failure code since tests failed, but executed cleanly
};

const runActualPlaywrightTests = () => {
  console.log(`${BOLD}${GREEN}[SUCCESS] Next.js server detected on ${HOST}${RESET}`);
  console.log(`Attempting to run Playwright E2E Test Suite...\n`);

  // Try to execute playwright tests
  // In a real environment, this runs `npx playwright test`
  const playwrightProcess = spawn('npx', ['playwright', 'test'], {
    stdio: 'inherit',
    shell: true
  });

  playwrightProcess.on('error', (err) => {
    console.error(`${RED}[ERROR] Failed to start Playwright runner: ${err.message}${RESET}`);
    console.log(`${YELLOW}Tip: Ensure Playwright is installed via 'npm install @playwright/test' and browsers via 'npx playwright install'.${RESET}`);
    process.exit(2);
  });

  playwrightProcess.on('exit', (code) => {
    console.log(`\nPlaywright test runner exited with code: ${code}`);
    process.exit(code || 0);
  });
};

// Main entry point
checkServer().then((isUp) => {
  if (isUp) {
    runActualPlaywrightTests();
  } else {
    runGracefulGreenfieldFail();
  }
});
