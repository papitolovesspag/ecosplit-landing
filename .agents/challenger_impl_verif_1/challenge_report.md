# Adversarial Review & Challenge Report - EcoSplit AI Landing Page

## Challenge Summary

**Overall risk assessment**: LOW

All 63 E2E test cases pass successfully. The landing page's DOM structure adheres perfectly to the interface and selector contracts. However, stress testing reveals minor failure modes and edge cases under extreme conditions.

---

## Challenges

### [Medium] Challenge 1: WebGL Initialization Crash
- **Assumption challenged**: Assumes the client browser/environment always supports WebGL and has hardware acceleration enabled.
- **Attack scenario**: A user with hardware acceleration disabled or using an older browser visits the landing page. `new THREE.WebGLRenderer` throws a fatal error because WebGL context cannot be created.
- **Blast radius**: Since the `useWebGL` hook does not wrap the Three.js initialization in a try-catch block, the uncaught exception will prevent the component from mounting, resulting in a blank page (React render failure).
- **Mitigation**: Wrap Three.js initialization inside a try-catch block inside `src/hooks/useWebGL.ts`. On failure, catch the error, log a warning, and fallback to a CSS linear-gradient background instead of crashing the app.

### [Low] Challenge 2: Scroll Division-by-Zero in 'How It Works'
- **Assumption challenged**: Assumes that the `section#how-it-works` height is always strictly greater than `window.innerHeight`.
- **Attack scenario**: Under extreme viewport resize or mobile viewports where virtual keyboards are toggled, if `sectionHeight - window.innerHeight` resolves to `0` or a negative value, the formula:
  `const progress = Math.max(0, Math.min(1, scrollPos / (sectionHeight - window.innerHeight)))`
  will result in division by zero (`scrollPos / 0` -> `Infinity` or `NaN`).
- **Blast radius**: The `progress` value is computed as `NaN` or `Infinity`. When passed to `Math.floor(progress * 4.99)`, it results in `NaN`, setting `activeStep` to `NaN`. This prevents any of the step panels (Step 0 to 4) from displaying, leaving the user with a blank area in "How It Works".
- **Mitigation**: Check if `sectionHeight - window.innerHeight <= 0` and, if so, default `progress` to `0` or `1` safely to avoid division by zero:
  `const denominator = sectionHeight - window.innerHeight;`
  `const progress = denominator <= 0 ? 0 : Math.max(0, Math.min(1, scrollPos / denominator));`

### [Low] Challenge 3: Focus Trap in Checkout Modal
- **Assumption challenged**: Assumes standard focus traversal is sufficient when overlay modals are open.
- **Attack scenario**: Keyboard-only user triggers the "AI Premium" checkout modal. The modal opens, but the focus is not programmatically trapped inside the modal container.
- **Blast radius**: The user can continue to tab "behind" the modal, accessing hidden page buttons and navigation anchors, breaking screen reader UX and violating WCAG A11y standards.
- **Mitigation**: Implement a focus trap within the checkout modal in `src/app/page.tsx`, or use a lightweight accessible dialog primitive.

---

## Stress Test Results

- **Run E2E tests with Next.js server online** → Starts Playwright browser instances → Executes all 63 test cases → **PASS (100% success rate)**
- **Disable WebGL support in browser** → `new THREE.WebGLRenderer` throws exception → Component crashes → **FAIL** (Predicted failure)
- **Set viewport height to match sectionHeight** → `denominator <= 0` → `progress = NaN` → **FAIL** (Predicted failure)

---

## Unchallenged Areas

- **Backend / DB integration** — Out of scope; this is a static Next.js landing page.
