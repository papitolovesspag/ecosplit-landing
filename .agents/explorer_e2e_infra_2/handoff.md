# E2E Test Infrastructure & Test Suite Design Report

## 1. Observation
We have inspected the project workspace and observed the following:
* **Workspace Contents**: The project directory `C:\Users\Chidi\Documents\Web Dev Projects\ecosplit-landing` contains only:
  * `.agents/` (agent workspace metadata directory)
  * `ORIGINAL_REQUEST.md` (root request file, 1644 bytes)
  * `PROJECT.md` (project planning and architecture file, 4271 bytes)
* **Code Layout Contract**: The `PROJECT.md` file defines the planned directory structure at lines 13-37:
  ```
  ├── e2e/                  # E2E Test suite
  │   ├── tests/            # Test cases (Tiers 1-4)
  │   └── runner.js         # Test runner script
  ```
* **Project Status**: The project is in a greenfield state. There is no `package.json`, `src/` folder, or application code implemented yet.

---

## 2. Logic Chain
Based on these observations, we conclude the following:
1. **Greenfield Constraint**: Running standard browser-based E2E tests (e.g., Playwright or Puppeteer) directly against `http://localhost:3000` will fail immediately with connection refused errors since the Next.js application has not been built or started.
2. **TDD Capability Requirement**: To support Test-Driven Development (TDD) and verify the E2E testing framework itself before implementation begins, we need a way to run tests and let them fail or pass gracefully.
3. **Stub Server Solution**: A robust strategy is to create a custom E2E runner (`runner.js`) that detects whether the real dev server is active. If it is not, the runner starts a local Node.js `http` server serving a static stub HTML file (`stub.html`) containing the basic structure (IDs, form elements, buttons) defined in the contracts.
4. **Tool Selection**: **Playwright** (`@playwright/test`) is selected as the primary E2E testing engine. It provides out-of-the-box multi-browser support (Chromium, Firefox, WebKit), auto-waiting, built-in HTML reports, and powerful simulation tools (throttling, viewport resizing) that are essential for the real-world scenarios outlined below.
5. **Test Case Coverage**: To ensure comprehensive coverage of all four landing page sections (Hero, How It Works, About Us, Contact Us) under various conditions, we designed **51 test cases** distributed across 4 tiers.

---

## 3. Caveats
* **Design Contract Adherence**: This design assumes the implementation track will strictly adhere to the IDs and contract layout defined in `PROJECT.md` (e.g., `#hero`, `#how-it-works`, `#about-us`, `#contact-us`, form field names, and scroll container heights). If these change, E2E selectors must be updated.
* **WebGL Testing Limitations**: We cannot easily test the visual fidelity of 3D WebGL fluid particles using standard E2E assertions. The tests will verify canvas presence, WebGL context creation, CPU/GPU frame rate thresholds, and reactivity to window events (scroll/mouse moves) by inspecting internal state hook bindings.
* **Animation Mocking**: The greenfield stub HTML will lack dynamic Framer Motion animations. Interactive scroll tests running against the stub will verify element visibility and scroll coordinates but will skip checking animation-triggered opacity/transform changes until the Next.js app is deployed.

---

## 4. Conclusion & Recommendations

### A. Test Runner Strategy
We recommend a **Playwright-based wrapper runner** located at `e2e/runner.js`.

#### Component Architecture
1. **`e2e/stub.html`**: A static HTML document containing basic section containers (`#hero`, `#how-it-works`, `#about-us`, `#contact-us`) and the contact form inputs/buttons.
2. **`e2e/stub-server.js`**: A lightweight Node.js script using the native `http` module to serve `stub.html` on a fallback port (e.g., `3001`).
3. **`e2e/runner.js`**: An orchestration script that:
   - Probes if the Next.js server on port `3000` is active.
   - If active, configures Playwright to run tests against `http://localhost:3000`.
   - If inactive, starts the stub server, configures Playwright to run against `http://localhost:3001` (injecting a mock flag), executes the test suite, and shuts down the stub server on completion.
   - Handles exit codes cleanly to ensure integration with CI/CD tools.

---

### B. Test Suite Specifications (51 Test Cases)

#### Tier 1: Feature Coverage (20 Test Cases)
Verify presence and base state of elements.

##### Hero Section
* **T1-H1: Hero Container Presence**: Verify that element `#hero` is present in the DOM and visible.
* **T1-H2: Branding and Heading**: Verify H1 exists containing "EcoSplit AI" and the value proposition text.
* **T1-H3: Reusable UI Glass Card**: Verify that at least one card in the Hero section displays glassmorphic style features (evaluating CSS rules `backdrop-filter` or blur).
* **T1-H4: Navigation Bar Links**: Verify presence of desktop navigation links targeting `#hero`, `#how-it-works`, `#about-us`, and `#contact-us`.
* **T1-H5: CTA Trigger Button**: Verify the "Get Started" or "Explore Savings" button exists.

##### How It Works Section
* **T1-W1: How It Works Container Presence**: Verify that element `#how-it-works` is present in the DOM.
* **T1-W2: Sticky Progress Wrapper**: Verify the presence of the sticky scroll track container.
* **T1-W3: Step Indicator UI**: Verify the step count indicator (e.g., "Step 1 of 3") is present.
* **T1-W4: Step 0 Initial Display**: Verify that on load, the step 0 content (energy baseline) is visible.
* **T1-W5: Abstract Visual Canvas Container**: Verify that the container for the Framer Motion step graphics is present.

##### About Us Section
* **T1-A1: About Us Container Presence**: Verify that element `#about-us` is present in the DOM.
* **T1-A2: Core Pillar/Team Cards**: Verify that at least 3 distinct card elements exist.
* **T1-A3: Card Headings**: Verify that cards have non-empty title/heading elements.
* **T1-A4: Neon Border Accent Presence**: Verify the CSS accent variables or styling elements for neon borders are applied to About Us cards.
* **T1-A5: Description Texts**: Verify that role/description text is populated in each card.

##### Contact Us Section
* **T1-C1: Contact Container Presence**: Verify that element `#contact-us` is present.
* **T1-C2: Form Inputs (Name, Email, Message)**: Verify inputs for name, email, and textarea for message exist.
* **T1-C3: Submit Button**: Verify a `<button type="submit">` is present in the form.
* **T1-C4: Input Placeholders**: Verify that the name, email, and message inputs have user-friendly placeholders.
* **T1-C5: Accessibility Labels**: Verify that each input has an associated `<label>` or `aria-label`.

---

#### Tier 2: Boundary and Corner Cases (20 Test Cases)
Verify extreme inputs, limits, and environmental boundaries.

##### Hero Section
* **T2-H1: Mobile Viewport Layout**: Resize viewport to 320px width (iPhone SE). Verify navigation collapses into a hamburger icon and Hero text wraps without overflowing screen width.
* **T2-H2: Ultra-Wide Viewport Centering**: Resize viewport to 2560px width. Verify that Hero content centers itself and does not stretch awkwardly.
* **T2-H3: WebGL Canvas Fallback**: Simulate a browser without WebGL support. Verify the canvas fails gracefully, and a CSS background fallback (dark gradient) is applied so that text remains legible.
* **T2-H4: Rapid CTA Double-Click**: Simulate double-clicking the CTA button quickly. Verify it does not break scroll physics or trigger double scroll animations.
* **T2-H5: Contrast Ratio Verification**: Evaluate color contrast on the Hero text against the glassmorphic background to verify it meets WCAG AA standards (>= 4.5:1).

##### How It Works Section
* **T2-W1: Top Scroll Bound**: Scroll to the exact top of the `#how-it-works` container. Verify scroll progress variable registers `0` and step index is capped at `0`.
* **T2-W2: Bottom Scroll Bound**: Scroll past the bottom of the sticky container. Verify scroll progress variable registers `1` and step index is capped at final step (e.g. `3`).
* **T2-W3: Rapid Scroll Flickering Protection**: Scroll rapidly back and forth. Verify step graphics do not flicker or overlap.
* **T2-W4: Resize During Scroll**: Scroll to Step 2, resize the browser window, and verify the step container adjusts height and active state calculations dynamically.
* **T2-W5: Reduced Motion Preference**: Set browser preference to `prefers-reduced-motion: reduce`. Verify that Framer Motion animations are disabled or instantly jump to the active step state instead of animating.

##### About Us Section
* **T2-A1: Card Grid Responsiveness**: Test at 768px (tablet) and 480px (mobile). Verify that cards wrap into 2 columns and 1 column layouts respectively.
* **T2-A2: Long Text Overflow**: Inject an extremely long string (e.g. 500 characters) into a team card bio. Verify that the card heights expand to fit the text without clipping or overlapping adjacent cards.
* **T2-A3: Keyboard Navigation & Focus states**: Verify that About Us cards can receive tab focus, and that focusing a card triggers the same neon visual state as mouse hovering.
* **T2-A4: Missing Headshot Fallback**: Simulate a failed image request (404) for team headshots. Verify that a stylized SVG fallback avatar with a neon border is rendered instead of a broken image symbol.
* **T2-A5: Box Shadow Viewport Contained**: Check that large neon blur shadow offsets do not cause horizontal page overflow or trigger horizontal scrollbars.

##### Contact Us Section
* **T2-C1: Empty Form Submission**: Click submit with all form fields empty. Verify standard HTML5 validation triggers, blocks submission, and shows native tooltips.
* **T2-C2: Invalid Email Address Format**: Input `test@invalid` and click submit. Verify email validation pattern rejects the input and prompts the user to enter a valid domain.
* **T2-C3: Character Length Limit Boundary**: Input 5,000 characters into the Message textarea. Verify that the input is capped by a `maxlength` attribute or displays a character limit warning.
* **T2-C4: Submit Button Double-Click Prevention**: Click submit and immediately verify that the submit button is set to a disabled state to block duplicate requests.
* **T2-C5: Offline Form State**: Disconnect browser network, fill form, and submit. Verify that the page displays a "network error" notice and retains user inputs in the form fields.

---

#### Tier 3: Cross-Feature Combinations (5 Test Cases)
Verify interactions between multiple sections/features.

* **T3-X1: Navigation Smooth Scroll & Active Indicator**: Click the "Contact Us" link in the navbar from the Hero section. Verify that:
  1. The page scrolls smoothly to `#contact-us`.
  2. During scrolling, the navbar active state transitions progressively through the section identifiers.
* **T3-X2: Scroll Animation Override by Navigation**: Scroll manually to Step 1 of the "How It Works" animation, then click the "Contact Us" link in the navbar. Verify the scroll overrides the step-by-step state, transitions directly to Contact Us, and resets the scroll progress values gracefully.
* **T3-X3: WebGL Background Responsive Speed**: Scroll from the Hero section to the About Us section. Verify that the WebGL canvas updates its speed/density parameters (e.g. slowing down from active interaction mode to ambient display mode).
* **T3-X4: Form Error/Success Anchor Stability**: Trigger validation errors in the Contact Form, scroll up to the Hero section, and scroll back down. Verify that errors remain in place and the form layout is stable.
* **T3-X5: Global Theme Neon Color Uniformity**: Perform a visual regression/color check across all sections (Hero, How It Works, About, Contact). Verify that the primary CSS color variables (neon green and cyan) maintain identical color values across elements.

---

#### Tier 4: Real-World Application Scenarios (6 Test Cases)
Verify end-to-end user journeys.

* **T4-S1: Standard Happy Path Conversion**:
  1. User lands on page.
  2. Moves mouse to interact with WebGL background.
  3. Scrolls down to read "How It Works" steps (Step 1 -> 2 -> 3).
  4. Reads the "About Us" team profiles.
  5. Fills out the Contact form with valid data.
  6. Submits and receives a visible success notification.
  7. Form fields automatically clear.
* **T4-S2: High Speed Direct Action**:
  1. User lands on page.
  2. Immediately clicks "Contact Us" navbar link.
  3. Form is focused automatically.
  4. User enters information and submits.
* **T4-S3: Reload Recovery**:
  1. User scrolls to the middle of "How It Works" (Step 2 active).
  2. Refreshes the browser.
  3. Verify that the page loads, scroll state is handled gracefully, and animations re-sync without layout shifts.
* **T4-S4: WebGL Interactivity Check**:
  1. User moves cursor rapidly across the WebGL canvas.
  2. Verify that particles shift or follow the cursor.
  3. Verify that the page maintains a smooth frame rate (>= 60 FPS) during active rendering.
* **T4-S5: Throttled Network Submission**:
  1. User fills the form.
  2. Network speed throttled to "Slow 3G".
  3. User clicks submit.
  4. Verify that button exhibits loading state ("Sending...") and is disabled during request round-trip, completing successfully upon response.
* **T4-S6: Keyboard Navigation (A11y Journey)**:
  1. Keyboard user tabs from top of the page.
  2. Verify that a "Skip to Content" skip-link appears.
  3. Tab through navbar menu, focusing links and activating scroll via Enter key.
  4. Tab through form fields, fill content, and submit via Enter key.

---

### C. Greenfield Test Runner Implementation Blueprints

Here is the design sketch of the files that will enable E2E testing in the greenfield state.

#### 1. `e2e/stub.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoSplit AI - Stub</title>
    <style>
        body { background-color: #030712; color: #ffffff; font-family: sans-serif; margin: 0; }
        section { min-height: 100vh; padding: 4rem 2rem; border-bottom: 1px solid #1f2937; }
        .glass-card { backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); }
        .neon-border { border-color: #10b981; }
        #how-it-works { height: 300vh; } /* Simulated scroll track */
        .sticky-track { position: sticky; top: 0; height: 100vh; }
    </style>
</head>
<body>
    <nav id="navbar">
        <a href="#hero">Hero</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#about-us">About Us</a>
        <a href="#contact-us">Contact Us</a>
    </nav>

    <section id="hero">
        <h1>EcoSplit AI</h1>
        <p>Premium energy-saving landing page.</p>
        <div class="glass-card">Value Prop Card</div>
        <button id="cta-button">Get Started</button>
        <canvas id="webgl-bg"></canvas>
    </section>

    <section id="how-it-works">
        <div class="sticky-track">
            <h2>How It Works</h2>
            <div id="step-indicator">Step 1 of 3</div>
            <div class="step-card" id="step-0">Baseline Setup</div>
        </div>
    </section>

    <section id="about-us">
        <h2>About Us</h2>
        <div class="glass-card neon-border" id="card-1">Card 1</div>
        <div class="glass-card neon-border" id="card-2">Card 2</div>
        <div class="glass-card neon-border" id="card-3">Card 3</div>
    </section>

    <section id="contact-us">
        <h2>Contact Us</h2>
        <form id="contact-form" novalidate>
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required placeholder="Your Name">
            
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Your Email">
            
            <label for="message">Message</label>
            <textarea id="message" name="message" required placeholder="Your Message" maxlength="5000"></textarea>
            
            <button type="submit" id="submit-btn">Send Message</button>
            <div id="form-feedback" style="display: none;"></div>
        </form>
    </section>

    <script>
        // Simple form interaction simulation
        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const feedback = document.getElementById('form-feedback');
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const msg = document.getElementById('message').value;

            if (!name || !email || !msg) {
                feedback.innerText = "Please fill all fields.";
                feedback.style.color = "red";
                feedback.style.display = "block";
                return;
            }
            if (!email.includes('@')) {
                feedback.innerText = "Invalid email.";
                feedback.style.color = "red";
                feedback.style.display = "block";
                return;
            }

            btn.disabled = true;
            btn.innerText = "Sending...";
            setTimeout(() => {
                feedback.innerText = "Message sent successfully!";
                feedback.style.color = "#10b981";
                feedback.style.display = "block";
                btn.disabled = false;
                btn.innerText = "Send Message";
                document.getElementById('contact-form').reset();
            }, 1000);
        });

        // Simple smooth scroll navigation
        document.getElementById('cta-button').addEventListener('click', () => {
            document.getElementById('contact-us').scrollIntoView({ behavior: 'smooth' });
        });
    </script>
</body>
</html>
```

#### 2. `e2e/runner.js`
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const PORT_APP = 3000;
const PORT_STUB = 3001;

// Function to check if a port is open
function checkPort(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true); // Port in use (server running)
            } else {
                resolve(false);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve(false); // Port free
        });
        server.listen(port);
    });
}

// Simple HTTP Stub Server
function startStubServer() {
    return http.createServer((req, res) => {
        const filePath = path.join(__dirname, 'stub.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading stub.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }).listen(PORT_STUB);
}

async function run() {
    const isAppRunning = await checkPort(PORT_APP);
    let targetUrl;
    let stubServer = null;

    if (isAppRunning) {
        console.log(`[E2E Runner] Detected application running on port ${PORT_APP}. Running tests against real app.`);
        targetUrl = `http://localhost:${PORT_APP}`;
    } else {
        console.log(`[E2E Runner] App not running on port ${PORT_APP}. Starting stub server on port ${PORT_STUB}...`);
        stubServer = startStubServer();
        targetUrl = `http://localhost:${PORT_STUB}`;
        process.env.E2E_MOCK_ENV = 'true';
    }

    process.env.PLAYWRIGHT_TEST_BASE_URL = targetUrl;

    console.log(`[E2E Runner] Starting Playwright test execution against ${targetUrl}...`);
    try {
        // Run Playwright CLI. In a real environment, this runs npx playwright test.
        // For testing runner flow:
        execSync('npx playwright test', { stdio: 'inherit' });
        console.log('[E2E Runner] Tests completed successfully!');
        if (stubServer) stubServer.close();
        process.exit(0);
    } catch (error) {
        console.error('[E2E Runner] Tests failed!');
        if (stubServer) stubServer.close();
        process.exit(1);
    }
}

run();
```

---

## 5. Verification Method
To independently verify the recommendations and the proposed E2E testing framework:
1. **Runner and Stub Validation**:
   - Run the command: `node e2e/runner.js` when package.json is initialized.
   - If the main server is offline, verify that the stub server launches on `http://localhost:3001` and Playwright tests execute against it.
   - Check that the stub server is killed immediately after Playwright completes or fails.
2. **Environment Switch Check**:
   - Start the main Next.js server on port 3000 (`npm run dev`).
   - Run the command: `node e2e/runner.js`.
   - Verify the runner console output: `[E2E Runner] Detected application running on port 3000. Running tests against real app.` and check that no stub server is started.
3. **Invalidation Conditions**:
   - The test run must fail if Playwright fails to find required IDs/classes (such as `#hero`, `#how-it-works`, `#about-us`, `#contact-us`, `.glass-card`, `#contact-form`).
