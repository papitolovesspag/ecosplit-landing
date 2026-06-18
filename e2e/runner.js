const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

// Definition of all 63 test cases across Tiers 1-4
const testCases = [
  // Hero Section (10 cases)
  { id: 1, tier: 1, file: 'hero.spec.js', name: 'Hero Wrapper Presence (section#hero)' },
  { id: 2, tier: 1, file: 'hero.spec.js', name: 'WebGL Background Canvas Presence (canvas#webgl-background)' },
  { id: 3, tier: 1, file: 'hero.spec.js', name: 'Core Headline Render (EcoSplit AI title)' },
  { id: 4, tier: 1, file: 'hero.spec.js', name: 'CTA Buttons Presence' },
  { id: 5, tier: 1, file: 'hero.spec.js', name: 'Glassmorphic Cards Presence' },
  { id: 6, tier: 2, file: 'hero.spec.js', name: 'CTA Button Hovers styling/glow' },
  { id: 7, tier: 2, file: 'hero.spec.js', name: 'Glassmorphic Card Hovers glowing borders' },
  { id: 8, tier: 2, file: 'hero.spec.js', name: 'Navigation Links (anchors present)' },
  { id: 9, tier: 2, file: 'hero.spec.js', name: 'Smooth Scroll Action on link click' },
  { id: 10, tier: 2, file: 'hero.spec.js', name: 'WebGL Mouse Interaction initialization' },

  // How It Works Section (10 cases)
  { id: 11, tier: 1, file: 'how-it-works.spec.js', name: 'How It Works Wrapper Presence (section#how-it-works)' },
  { id: 12, tier: 1, file: 'how-it-works.spec.js', name: 'Step-by-Step Container exists' },
  { id: 13, tier: 1, file: 'how-it-works.spec.js', name: 'Step Indicators presence' },
  { id: 14, tier: 1, file: 'how-it-works.spec.js', name: 'Explanatory Copy of energy-saving logic' },
  { id: 15, tier: 1, file: 'how-it-works.spec.js', name: 'Scroll Guidance Indicators' },
  { id: 16, tier: 2, file: 'how-it-works.spec.js', name: 'Sticky Container Height validation (400vh)' },
  { id: 17, tier: 2, file: 'how-it-works.spec.js', name: 'Step Transition (0 to 1) updates UI' },
  { id: 18, tier: 2, file: 'how-it-works.spec.js', name: 'Step Transition (1 to 2) updates UI' },
  { id: 19, tier: 2, file: 'how-it-works.spec.js', name: 'Step Transition (2 to 3) updates UI for Step 3' },
  { id: 20, tier: 2, file: 'how-it-works.spec.js', name: 'Step Transition (3 to 4) and Reverse Scroll validation' },

  // About Us Section (10 cases)
  { id: 21, tier: 1, file: 'about-us.spec.js', name: 'About Us Wrapper Presence (section#about-us)' },
  { id: 22, tier: 1, file: 'about-us.spec.js', name: 'Founder Profile container presence' },
  { id: 23, tier: 1, file: 'about-us.spec.js', name: 'Founder Profile image and bio placeholders presence' },
  { id: 24, tier: 1, file: 'about-us.spec.js', name: 'Founder Profile company mission statement presence' },
  { id: 25, tier: 1, file: 'about-us.spec.js', name: 'Brand Logo / Assets check' },
  { id: 26, tier: 2, file: 'about-us.spec.js', name: 'Founder Profile hover glow effects' },
  { id: 27, tier: 2, file: 'about-us.spec.js', name: 'Founder Profile social media links/icons and hovers' },
  { id: 28, tier: 2, file: 'about-us.spec.js', name: 'Content Expandable Elements expand/collapse' },
  { id: 29, tier: 2, file: 'about-us.spec.js', name: 'Keyboard Tab Navigation focus on About us elements' },
  { id: 30, tier: 2, file: 'about-us.spec.js', name: 'WebGL Scroll Adjustment on scroll speed/density' },

  // Pricing Section (10 cases)
  { id: 31, tier: 1, file: 'pricing.spec.js', name: 'Pricing section wrapper section#pricing presence' },
  { id: 32, tier: 1, file: 'pricing.spec.js', name: 'Pricing section header title and subtitle presence' },
  { id: 33, tier: 1, file: 'pricing.spec.js', name: 'Two pricing cards (.pricing-card) presence' },
  { id: 34, tier: 1, file: 'pricing.spec.js', name: 'Pricing cards tier names (Free Core and AI Premium)' },
  { id: 35, tier: 1, file: 'pricing.spec.js', name: 'Pricing cards pricing values and feature lists' },
  { id: 36, tier: 2, file: 'pricing.spec.js', name: 'Monthly/Yearly toggle switch presence' },
  { id: 37, tier: 2, file: 'pricing.spec.js', name: 'Toggling Monthly/Yearly updates prices/billing text' },
  { id: 38, tier: 2, file: 'pricing.spec.js', name: 'Pricing cards glassmorphic neon glow border hovers' },
  { id: 39, tier: 2, file: 'pricing.spec.js', name: 'Pricing buttons interactivity and focus states' },
  { id: 40, tier: 2, file: 'pricing.spec.js', name: 'Pricing grid layout responsiveness on viewport resize' },

  // Contact Us Section (10 cases)
  { id: 41, tier: 1, file: 'contact-us.spec.js', name: 'Contact Us Wrapper Presence (section#contact-us)' },
  { id: 42, tier: 1, file: 'contact-us.spec.js', name: 'Form Render (form#contact-form)' },
  { id: 43, tier: 1, file: 'contact-us.spec.js', name: 'Input Labels and Placeholders' },
  { id: 44, tier: 1, file: 'contact-us.spec.js', name: 'Submit Button presence' },
  { id: 45, tier: 1, file: 'contact-us.spec.js', name: 'Contact placeholders/icons (GitHub, LinkedIn, Email, Phone) presence' },
  { id: 46, tier: 2, file: 'contact-us.spec.js', name: 'Blank Form Rejection validation' },
  { id: 47, tier: 2, file: 'contact-us.spec.js', name: 'Invalid Email Validation' },
  { id: 48, tier: 2, file: 'contact-us.spec.js', name: 'Submission Success Feedback animation' },
  { id: 49, tier: 2, file: 'contact-us.spec.js', name: 'Invalid Inputs Highlighting (red borders)' },
  { id: 50, tier: 2, file: 'contact-us.spec.js', name: 'Active Input Styling (green/cyan focus glow)' },

  // Cross-Feature (4 cases)
  { id: 51, tier: 3, file: 'cross-feature.spec.js', name: 'Header Scroll Styles (blur/background fill)' },
  { id: 52, tier: 3, file: 'cross-feature.spec.js', name: 'Active Nav Link Tracking on scroll' },
  { id: 53, tier: 3, file: 'cross-feature.spec.js', name: 'WebGL Scroll Coupling with shader properties' },
  { id: 54, tier: 3, file: 'cross-feature.spec.js', name: 'Form Submit Coordination and state' },

  // Scenarios (5 cases)
  { id: 55, tier: 4, file: 'scenarios.spec.js', name: 'E2E Scenario 1: CTA-to-Demo Flow' },
  { id: 56, tier: 4, file: 'scenarios.spec.js', name: 'E2E Scenario 2: Founder Profile Discovery' },
  { id: 57, tier: 4, file: 'scenarios.spec.js', name: 'E2E Scenario 3: Complete Lead Generation' },
  { id: 58, tier: 4, file: 'scenarios.spec.js', name: 'E2E Scenario 4: Pricing Selection and Checkout Flow' },
  { id: 59, tier: 4, file: 'scenarios.spec.js', name: 'E2E Scenario 5: Full Keyboard Accessibility Run' },

  // Theme Toggle (4 cases)
  { id: 60, tier: 1, file: 'theme.spec.js', name: 'Theme Toggle UI Presence' },
  { id: 61, tier: 2, file: 'theme.spec.js', name: 'Theme State Persistence' },
  { id: 62, tier: 3, file: 'theme.spec.js', name: 'Theme Toggle WebGL Background Sync' },
  { id: 63, tier: 4, file: 'theme.spec.js', name: 'Light Mode Contrast/A11y Conformance' }
];

// Check if port 3000 is active AND serving EcoSplit page
function checkServer(port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // We verify that the response is HTML and contains the string "EcoSplit"
        if (res.statusCode === 200 && data.includes('EcoSplit')) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Check if Playwright is installed
function isPlaywrightInstalled() {
  try {
    require.resolve('@playwright/test');
    return true;
  } catch (e) {
    return false;
  }
}

// Runs dry run checklist
function runGreenfieldValidation(reason) {
  console.log('\x1b[1m\x1b[33m%s\x1b[0m', '==================================================');
  console.log('\x1b[1m\x1b[33m%s\x1b[0m', `  ECOSPLIT AI E2E RUNNER - GREENFIELD VALIDATION MODE`);
  console.log('\x1b[1m\x1b[33m%s\x1b[0m', '==================================================');
  console.log(`Reason: ${reason}\n`);

  let currentFile = '';
  testCases.forEach((tc) => {
    if (tc.file !== currentFile) {
      currentFile = tc.file;
      console.log(`\n\x1b[1m\x1b[36mFile: e2e/tests/${currentFile}\x1b[0m`);
    }
    console.log(`  \x1b[31m[FAIL]\x1b[0m Case #${tc.id} [Tier ${tc.tier}]: ${tc.name}`);
    console.log(`         -> Reason: ${reason}`);
  });

  console.log('\n\x1b[1m\x1b[33m%s\x1b[0m', '--------------------------------------------------');
  console.log('\x1b[1m\x1b[31m%s\x1b[0m', `  SUMMARY:`);
  console.log(`  Total Tests:  ${testCases.length}`);
  console.log(`  Passed:       0`);
  console.log(`  Failed:       ${testCases.length}`);
  console.log('\x1b[1m\x1b[33m%s\x1b[0m', '==================================================');
  process.exit(1);
}

async function main() {
  const serverOnline = await checkServer(3000);
  const playwrightReady = isPlaywrightInstalled();

  if (!serverOnline) {
    runGreenfieldValidation('Website not implemented / server offline');
    return;
  }

  if (!playwrightReady) {
    runGreenfieldValidation('Playwright dependencies not installed');
    return;
  }

  console.log('\x1b[1m\x1b[32m%s\x1b[0m', 'Server is online and Playwright is installed. Launching E2E tests...');
  
  const testCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(testCmd, ['playwright', 'test', 'e2e/tests'], {
    stdio: 'inherit',
    shell: true
  });

  child.on('close', (code) => {
    process.exit(code);
  });
}

main().catch((err) => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
