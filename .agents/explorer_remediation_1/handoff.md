# Handoff Report — Explorer 1

This handoff report summarizes the findings, logic, and recommended plan to remediate the integrity violations and edge cases on the EcoSplit AI landing page.

---

## 1. Observation

During our investigation, we inspected and verified the following elements in the codebase:

* **Observation 1 (Technology Bypass):** In `src/app/page.tsx`, scroll state is managed manually via a scroll listener and React state rather than `framer-motion` hooks:
  - Lines 34–53:
    ```typescript
    useEffect(() => {
      const handleScroll = () => {
        const section = document.getElementById("how-it-works");
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrollPos = -rect.top;
        
        // Calculate progress of scroll inside the 400vh section
        const progress = Math.max(0, Math.min(1, scrollPos / (sectionHeight - window.innerHeight)));
        
        // Map progress to steps 0 to 4
        const step = Math.floor(progress * 4.99);
        setActiveStep(step);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    ```

* **Observation 2 (Layout Compliance Failure):** The folder `src/components/` only contains `WebGLBackground.tsx`, `ClientWebGLBackground.tsx`, and `Navbar.tsx`. The separate section files `Hero.tsx`, `HowItWorks.tsx`, `AboutUs.tsx`, `ContactUs.tsx`, and the `src/components/ui/` directory specified in `PROJECT.md` do not exist. Instead, all markup and interactive states are defined in `src/app/page.tsx` (lines 70–437).

* **Observation 3 (WebGL Initialization Crash):** In `src/hooks/useWebGL.ts`, the `WebGLRenderer` is instantiated raw without try-catch:
  - Lines 26–30:
    ```typescript
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    ```
    If WebGL is unavailable, this throws a fatal uncaught error.

* **Observation 4 (Scroll Division-by-Zero):** In `src/app/page.tsx` line 44:
  ```typescript
  const progress = Math.max(0, Math.min(1, scrollPos / (sectionHeight - window.innerHeight)));
  ```
  If `sectionHeight === window.innerHeight` (e.g. under specific viewport heights), the divisor evaluates to `0`, resulting in a `NaN` division.

* **Observation 5 (Checkout Modal Focus Trap):** In `src/app/page.tsx` lines 416–434, the checkout modal is conditionally rendered based on `showCheckoutModal` state:
  ```typescript
  {showCheckoutModal && (
    <div className="checkout-modal-overlay" onClick={() => setShowCheckoutModal(false)}>
      <div className="checkout-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Upgrade</h3>
        <p>You selected the <strong>AI Premium</strong> plan ({billingCycle === "monthly" ? "$29/mo" : "$19/mo, billed annually"}).</p>
        <div className="checkout-actions">
          <button className="btn-cta btn-primary" onClick={() => {
            alert("Thank you for your purchase!");
            setShowCheckoutModal(false);
          }}>
            Complete Checkout
          </button>
          <button className="btn-cta btn-secondary" onClick={() => setShowCheckoutModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
  ```
  This is a basic HTML overlay. It lacks focus capturing, active element trapping, or Escape key listener overrides.

---

## 2. Logic Chain

1. **Observations 1 & 2** show that the project bypasses the required animation library `framer-motion` for scroll transitions, and violates layout guidelines by placing all landing page content in `src/app/page.tsx`.
2. Therefore, to ensure layout compliance and technology compliance, `page.tsx` must be refactored into separate files under `src/components/` (`Hero.tsx`, `HowItWorks.tsx`, `AboutUs.tsx`, `ContactUs.tsx`, `Pricing.tsx`), and a dedicated `ui/` directory containing primitives like `Card.tsx` and `Modal.tsx`.
3. To replace the technology bypass, `framer-motion`'s `useScroll` and `useTransform` hooks must be implemented inside `HowItWorks.tsx`. By attaching `useScroll` to a `ref` on the outer `400vh` container, scroll progress can be tracked natively.
4. **Observation 3** shows that Three.js initialization will fail catastrophically if WebGL is unsupported. Wrapping `new THREE.WebGLRenderer` inside a try-catch block allows us to catch this exception, log a warning, and safely return from the React hook. This ensures the rest of the application remains functional.
5. **Observation 4** indicates that the division-by-zero risk is caused by manual progress calculations. By migrating the scroll handler to `framer-motion`'s native scroll progress tracking, the manual division is eliminated, resolving this edge case.
6. **Observation 5** reveals that the checkout modal lacks accessibility features. Creating a custom `<Modal>` component with keyboard listeners that intercepts `Tab` and `Shift + Tab` to cycle focus within its bounds and close on `Escape` fixes the focus trap issue.

---

## 3. Caveats

* We have assumed that separating sections into individual components will not conflict with the stylesheet classes in `src/app/globals.css`. The CSS classes are globally scoped (Vanilla CSS), so extracting elements should preserve styles perfectly.
* We have not run the E2E tests on a running server because our task is read-only. We validated that the project builds correctly via Next.js Turbopack and TypeScript compiles successfully.

---

## 4. Conclusion

The codebase is functional but fails to comply with layout and technology standards, and has three major edge-case vulnerabilities. 

To remediate:
1. Split `page.tsx` into modular components (`Hero.tsx`, `HowItWorks.tsx`, `AboutUs.tsx`, `Pricing.tsx`, `ContactUs.tsx`) and UI components (`Card.tsx`, `Modal.tsx`).
2. Implement `useScroll` and `useTransform` in `HowItWorks.tsx` to handle scroll progress.
3. Protect the WebGL hook `useWebGL.ts` from crashes using a try-catch statement.
4. Implement a custom keyboard focus trap hook inside `Modal.tsx`.

A complete refactoring plan is available in `analysis.md`.

---

## 5. Verification Method

To independently verify the proposed fixes after implementation:

1. **Verify Layout Compliance:** Confirm that the files `Hero.tsx`, `HowItWorks.tsx`, `AboutUs.tsx`, `ContactUs.tsx`, `Pricing.tsx` exist in `src/components/`, and `Card.tsx` and `Modal.tsx` exist in `src/components/ui/`.
2. **Verify Animations:** Check that `framer-motion` is imported in `HowItWorks.tsx` and that `useScroll` is bound to the container element.
3. **Run E2E Test Suite:** Start the server on port 3000 (`npm run dev` or `npm run build && npm run start`) and execute:
   ```bash
   npm run test:e2e
   ```
   All 63 test cases across Tiers 1-4 must pass.
4. **WebGL Fallback Verification:** Emulate a browser environment without WebGL support (e.g. using Chrome's rendering panel to disable WebGL or by mocking `HTMLCanvasElement.prototype.getContext` in tests) and verify the page loads and is fully interactive without throwing errors.
5. **Focus Trap Verification:** Open the Checkout Modal, press `Tab` repeatedly, and confirm that the focus cycles strictly between the "Complete Checkout" and "Cancel" buttons, and pressing `Escape` closes the modal.
