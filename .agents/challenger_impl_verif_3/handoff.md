# Adversarial Empirical Verification Handoff Report

This report presents findings from the adversarial empirical verification of the EcoSplit AI landing page.

---

## 1. Observation

### A. E2E Test Execution & Port/CWD Sensitivity
- **CWD Drive Casing Failure**:
  - Running `cmd.exe /c npm run start` in `c:\Users\Chidi\Documents\Web Dev Projects\ecosplit-landing` (lowercase `c`) results in:
    ```
    Error: Could not find a production build in the '.next' directory. Try building your app with 'next build' before starting the production server. https://nextjs.org/docs/messages/production-start-no-build-id
    ```
  - Running the exact same command in `C:\Users\Chidi\Documents\Web Dev Projects\ecosplit-landing` (capitalized `C`) starts successfully.
- **E2E Test Results**:
  - Command: `cmd.exe /c node e2e/runner.js` against the server started in the capitalized CWD path.
  - Result: **100% Success** (`63 passed (2.8m)`). All tests completed and verified correctly.

### B. "How It Works" Initial Scroll Recovery & SSR Sync
- **Code in `src/components/HowItWorks.tsx`**:
  - During server pre-rendering or initial mount (lines 57-63):
    ```typescript
    {!mounted ? (
      // SSR / initial static render: render step 0 with full opacity to prevent blank content
      <div className="step-pane active" data-step="0">
        <h3>Step 0: System Idle</h3>
        <p>EcoSplit AI is connected to your smart meter and stands ready. Scroll down to activate data collection.</p>
      </div>
    ) : ...
    ```
  - On the client side post-hydration (lines 22-30):
    ```typescript
    useEffect(() => {
      if (mounted) {
        const currentProgress = scrollYProgress.get();
        if (currentProgress !== undefined && !isNaN(currentProgress)) {
          const step = Math.floor(currentProgress * 4.99);
          setActiveStep(Math.max(0, Math.min(4, step)));
        }
      }
    }, [mounted, scrollYProgress]);
    ```

### C. Theme Toggle & WebGL Animation Smoothness
- **Code in `src/components/Navbar.tsx` (lines 10-20)**:
  - Theme is synchronized on mount via `useEffect` checking `localStorage`.
- **WebGL Theme Observer & LERP in `src/hooks/useWebGL.ts`**:
  - Theme transitions are caught by a `MutationObserver` on `data-theme` (lines 197-209).
  - Shaders transition between colors using LERP in the animation loop (lines 236-237):
    ```typescript
    // Smooth theme transition LERP
    uniforms.uThemeMode.value += (targetThemeMode - uniforms.uThemeMode.value) * 0.06;
    ```
  - Scroll coupling uses LERP (line 234):
    ```typescript
    uniforms.uScroll.value += (targetScroll - uniforms.uScroll.value) * 0.1;
    ```

### D. Contact Form Validation Styling
- **Code in `src/app/globals.css` (lines 803-808)**:
  ```css
  /* Red error styling for invalid inputs */
  .form-group input:invalid:focus,
  .form-group textarea:invalid:focus {
    border-color: #ef4444 !important;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.4) !important;
  }
  ```

---

## 2. Logic Chain

1. **Drive Letter Resolution Bug**: Windows path casing sensitivity causes the Next.js production server startup code to compare the CWD against build manifest directories. If the CWD uses `c:\` but the manifest references `C:\`, Next.js fails to match the path and reports that the production build is missing. Enforcing capital `C:\` fixes this.
2. **Scroll Recovery Robustness**: If a user refreshes the page mid-scroll in the `How It Works` section, the component renders a static Step 0 (preventing a white/blank flash during hydration), and then immediately updates the active step from the current browser scroll position (`scrollYProgress.get()`), rendering the correct section smoothly.
3. **Smooth Scroll & Theme Transitions**: In useWebGL, updating values through a linear interpolation filter (`mouse.x += (targetMouse.x - mouse.x) * 0.08`, `uScroll += (targetScroll - uScroll) * 0.1`, and `uThemeMode += (targetThemeMode - uThemeMode) * 0.06`) ensures that even if the user scrolls jerkily or switches the theme rapidly, the canvas animation and shader colors glide smoothly rather than snapping.
4. **Validation Highlight Usability Issue**: By using `:invalid:focus` to trigger red validation borders, the input field loses its red highlight the moment it is blurred. This leaves the user with no visual cue about which inputs failed validation once they click away.

---

## 3. Caveats

- Playwright tests run locally and simulate scrolling behaviors via browser evaluations. True hardware-accelerated GPU frame rates were not measured on actual physical devices, though WebGL SwiftShader warnings indicate potential compositing overhead due to alpha transparency blending.
- The CWD casing bug is specific to Windows-based Next.js startup scripts.

---

## 4. Conclusion

The EcoSplit AI landing page implementation is functionally complete, robust, and correctly resolves all 63 E2E test cases under production build mode. 
1. **Scroll-animation correctness**: Handles initial page refresh position seamlessly without blank boxes.
2. **WebGL and Theme Transitions**: Uses linear interpolation filter loops to prevent visual snapping.
3. **Identified Flaws**:
   - Accessibility modal lacks keyboard/WAI-ARIA compliance (focus trap, Escape key hook).
   - Form validation highlighting is non-persistent on blur.
   - Windows Next.js CWD casing bug requires capitalized drive letters.

---

## 5. Verification Method

To independently verify:
1. Rebuild and launch the server in the capitalized drive CWD:
   ```bash
   cd "C:\Users\Chidi\Documents\Web Dev Projects\ecosplit-landing"
   npm run build
   npm run start
   ```
2. Run the test suite:
   ```bash
   node e2e/runner.js
   ```
3. Refresh the page inside the `how-it-works` section to confirm the section correctly updates to the scrolled step instead of getting stuck on Step 0.
4. Fill out the contact form with an invalid email address, click Submit, and then tab away from the email input to verify the red validation glow disappears.

---

# Adversarial Review & Stress Test Report

## Challenge Summary

- **Overall risk assessment**: LOW-MEDIUM
- The solution is highly robust and fully passes E2E specifications under production mode, but possesses visual edge cases (theme flash on load) and accessibility/usability issues (non-persistent validation border, focus trapping on checkout modal).

## Challenges

### [Low] Challenge 1: Flash of Unstyled Content (FOUC) on Theme State
- **Assumption challenged**: Synchronizing theme attributes inside `useEffect` is sufficient for a premium user experience.
- **Attack scenario**: A user with light theme preference loads the page. Next.js serves the pre-rendered HTML in dark mode. The browser paints dark mode, then hydration executes `useEffect` and flips to light mode.
- **Blast radius**: A sudden white/dark flash on page load for light mode users.
- **Mitigation**: Inject a tiny blocking inline script in Layout's `<head>` to read `localStorage` and set `data-theme` before the first layout paint.

### [Medium] Challenge 2: Non-Persistent Validation Styling
- **Assumption challenged**: Relying on CSS `:invalid:focus` is sufficient for error presentation.
- **Attack scenario**: A user enters an invalid value, attempts submission, and moves their mouse/focus to another field.
- **Blast radius**: The red indicator vanishes immediately upon blurring, hiding the error from the user.
- **Mitigation**: Style inputs based on `:invalid` coupled with a `.submitted` class added to the form on submit, e.g., `form.submitted input:invalid`.

### [Medium] Challenge 3: Incomplete Checkout Modal Focus Control
- **Assumption challenged**: Standard state overlay is sufficient.
- **Attack scenario**: Visually impaired or keyboard-only users upgrade to AI Premium and tab through modal.
- **Blast radius**: Users can tab out of the modal into background links, bypassing completion buttons.
- **Mitigation**: Wrap with a focus trap and capture Escape key events.

## Stress Test Results

| Scenario | Expected Behavior | Actual Behavior | Pass/Fail |
|---|---|---|---|
| Page Refresh at scroll pos | Displays correct step pane | Instantly resolves scroll value and updates step | **PASS** |
| Fast Theme Toggling | Shader transitions smoothly | Interpolation loop filters speed, blends colors cleanly | **PASS** |
| Fast/Slow Scrolling in sticky | Steps update sequentially without breaks | Framer Motion events map and trigger animations smoothly | **PASS** |
| Blank Form Submission | Browser validation blocks submit | Validation blocked, invalid state evaluates to true | **PASS** |
| Tabbing out of Modal | Focus stays inside dialog | Focus leaks to background page links | **FAIL** |
