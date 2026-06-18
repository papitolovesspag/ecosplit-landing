# Handoff Report — Explorer 2

## 1. Observation
We observed the following inside the EcoSplit AI landing page workspace:

- **Layout Violations**: In `src/app/page.tsx` (lines 71-435), all major sections (`Hero`, `HowItWorks`, `AboutUs`, `Pricing`, `ContactUs`, and the checkout modal overlay) are inlined inside a single page component. The files `Hero.tsx`, `HowItWorks.tsx`, `AboutUs.tsx`, and `ContactUs.tsx` are missing from `src/components/`, violating `PROJECT.md` layout specifications (lines 23-31).
- **Manual Scroll Animations**: In `src/app/page.tsx` (lines 34-53), scroll-linked active step transitions are calculated via a manual window scroll listener and raw calculation:
  ```typescript
  const progress = Math.max(0, Math.min(1, scrollPos / (sectionHeight - window.innerHeight)));
  ```
  No `framer-motion` hooks are imported or utilized, violating `PROJECT.md` specifications (lines 62-63).
- **WebGL Crash Risk**: In `src/hooks/useWebGL.ts` (line 26), `THREE.WebGLRenderer` is initialized without error wrapping:
  ```typescript
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  ```
  This crashes the React component tree on devices/browsers that do not support WebGL, such as headless Playwright execution. Running the test command `node e2e/runner.js` showed 8 failed test cases due to `ERR_CONNECTION_REFUSED` page load errors:
  ```
  1) e2e\tests\about-us.spec.js:10:3 › About Us Section - Tiers 1 & 2 › Case 21: About Us section wrapper section#about-us is present in the DOM 
    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  ```
- **Division-by-Zero Risk**: In `src/app/page.tsx` (line 44), dividing by `(sectionHeight - window.innerHeight)` is vulnerable to division-by-zero or negative results (resulting in `NaN` or incorrect indexes) when page height <= viewport height.
- **Accessibility Violations**: In `src/app/page.tsx` (lines 416-434), the checkout modal has no keyboard focus trapping, meaning keyboard users can Tab out of the modal overlay, focus is not set on open, escape key is not bound, and previous focus is not restored.

---

## 2. Logic Chain
1. **Component Decomposition**: Because the React states in `page.tsx` (`bioExpanded`, `formSubmitted`, `activeStep`, `billingCycle`, `showCheckoutModal`) are highly localized to their respective sections, they can be fully isolated. Decomposing these sections into individual components under `src/components/` makes the codebase clean and modular, resolving layout violations.
2. **Scroll Animation Migration**: Using Framer Motion's `useScroll` and `useMotionValueEvent` hooks will replace custom viewport arithmetic, mitigating division-by-zero errors and utilizing optimized animation listeners. Combining it with `AnimatePresence` and `motion.div` will yield smooth visual step transitions.
3. **WebGL Robustness**: Placing a `try-catch` around `THREE.WebGLRenderer` in `useWebGL.ts` and returning a no-op cleanup callback allows the app to remain functional (silent fallback) in environments without WebGL, preventing full-screen rendering crashes.
4. **Modal Focus Trap**: Implementing a custom `useFocusTrap` hook to capture Tab, Shift-Tab, and Escape keyboard events aligns the checkout modal overlay with WAI-ARIA accessibility requirements.

---

## 3. Caveats
- **E2E Selector Mapping**: E2E tests are strictly bound to target elements and class naming (e.g. `[data-step="X"]`, `step-active`, `final-state`). Refactored components must output these exact selectors to pass verification.
- **Header Tracking**: The main navbar uses bounding client rect scroll listening to track the active nav section; decomposing page components must not change element IDs or layout markers (`#hero`, `#how-it-works`, `#about-us`, `#pricing`, `#contact-us`) to keep header tracking functional.

---

## 4. Conclusion
We recommend implementing a complete refactoring of `src/app/page.tsx` into separate files: `src/components/Hero.tsx`, `src/components/HowItWorks.tsx` (utilizing Framer Motion scroll hooks), `src/components/AboutUs.tsx`, `src/components/Pricing.tsx` (including the checkout modal), and `src/components/ContactUs.tsx`. The WebGL hook should be wrapped in `try-catch` to prevent fatal rendering crashes, and the modal should use a `useFocusTrap` hook to satisfy accessibility compliance. Detailed proposed code and implementation specifications are recorded in `analysis.md`.

---

## 5. Verification Method
1. **Verify Files**: Verify that the decomposed component files exist under `src/components/` and are correctly referenced.
2. **Run E2E Tests**:
   Execute the test suite via Node.js:
   ```bash
   node e2e/runner.js
   ```
   All 63 test cases (including scroll transitions, accessibility runs, contrast tests, and WebGL elements) must return `[PASS]` status.
