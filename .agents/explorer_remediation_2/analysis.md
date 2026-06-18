# Analysis Report — Refactoring Strategy for EcoSplit AI Landing Page

## Core Summary
This report analyzes layout, animation, and accessibility violations in the EcoSplit AI landing page and proposes a comprehensive refactoring strategy. The strategy details the decomposition of `src/app/page.tsx` into self-contained components matching `PROJECT.md`, the integration of `framer-motion` for scroll-linked animations, and the remediation of WebGL stability, division-by-zero, and focus trap bugs.

---

## 1. Observations

We observed the following architectural violations and bugs in the codebase:

### A. Layout Violations
- **File**: `src/app/page.tsx` (lines 1-438)
- **Violation**: Major landing page components (`Hero`, `HowItWorks`, `AboutUs`, `Pricing`, `ContactUs`, and the `CheckoutModal`) are completely inlined within the main `Home` page component. 
- **Missing Files**: The following components, specified in the `PROJECT.md` directory layout (lines 23-31), do not exist in the filesystem:
  - `src/components/Hero.tsx`
  - `src/components/HowItWorks.tsx`
  - `src/components/AboutUs.tsx`
  - `src/components/ContactUs.tsx`
- Only `WebGLBackground.tsx`, `ClientWebGLBackground.tsx`, and `Navbar.tsx` are currently present in `src/components/`.

### B. Missing Framer Motion Scroll Integration
- **File**: `src/app/page.tsx` (lines 34-53, lines 124-200)
- **Violation**: The scroll progress indicator and active step mapping inside the "How It Works" section are implemented via a manual window scroll listener and React state hook. 
- `framer-motion` is listed as a project dependency in `package.json` (line 14: `"framer-motion": "^12.40.0"`), but is not imported or used in the landing page sections. This violates the `PROJECT.md` specification (lines 62-63) requiring Framer Motion's `useScroll` and `useTransform` to drive step-by-step animations.

### C. WebGL Renderer Fatal Crash
- **File**: `src/hooks/useWebGL.ts` (line 26)
- **Bug**: The Three.js WebGL renderer is initialized directly:
  ```typescript
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  ```
- **Result**: In environments where WebGL is unsupported or disabled (such as headless test browsers, older mobile devices, or virtual machines), the `WebGLRenderer` constructor throws a fatal WebGL-related error. Because this is unhandled, it crashes the entire React application mount, leading to a blank page and causing cascading E2E test failures (8 tests failed out of 63 during test runs due to connection and render failures).

### D. Division-by-Zero/NaN Scroll Vulnerability
- **File**: `src/app/page.tsx` (line 44)
- **Bug**: The scroll progress is calculated using:
  ```typescript
  const progress = Math.max(0, Math.min(1, scrollPos / (sectionHeight - window.innerHeight)));
  ```
- **Result**: If the "How It Works" section height (`sectionHeight`) is less than or equal to the viewport height (`window.innerHeight`), the denominator is `0` or negative. If it is `0`, the division yields `NaN` or `Infinity`, causing calculations to break and making the interactive steps non-functional.

### E. Checkout Modal Focus Trap Missing
- **File**: `src/app/page.tsx` (lines 416-434)
- **Bug**: The checkout modal is rendered conditionally and styled as a dialog:
  ```typescript
  {showCheckoutModal && (
    <div className="checkout-modal-overlay" onClick={() => setShowCheckoutModal(false)}>
      <div className="checkout-modal glass-card" onClick={(e) => e.stopPropagation()}>
        ...
      </div>
    </div>
  )}
  ```
- **Result**: Keyboard navigation (`Tab` and `Shift + Tab`) is not intercepted. When the modal is open, users can tab out of the modal into background elements. Focus is not auto-selected on open, the `Escape` key does not close the modal, and focus is not restored to the triggering button on close, violating WAI-ARIA accessibility guidelines.

---

## 2. Logic Chain

1. **State Isolation**: Tracing the states in `src/app/page.tsx` reveals that each section is logically independent:
   - `bioExpanded` is only used in `AboutUs`.
   - `formSubmitted` and `formData` are only used in `ContactUs`.
   - `activeStep` is only used in `HowItWorks`.
   - `billingCycle` and `showCheckoutModal` are only used in `Pricing` and the `CheckoutModal`.
   Therefore, page.tsx can be completely decomposed into self-contained components without requiring global state management (such as Context or Redux) or prop-drilling, simplifying the architecture.
2. **Scroll Animation Migration**: By replacing the manual scroll calculation in `HowItWorks` with Framer Motion's `useScroll` and `useMotionValueEvent` hooks:
   - We eliminate manual scroll calculations.
   - We leverage Framer Motion's optimized performance.
   - We can wrap step transitions in `AnimatePresence` and `motion.div` for a professional, smooth fading transition.
3. **WebGL Stability**: Adding a `try-catch` around the `THREE.WebGLRenderer` initialization inside `useWebGL.ts` and returning a safe fallback (no-op cleanup) guarantees the React application will not crash on devices lacking WebGL acceleration.
4. **Division-by-Zero Protection**: Introducing a denominator check (`denominator > 0`) in all scroll progress calculations ensures mathematical safety and prevents `NaN` or `Infinity` errors.
5. **Accessibility Fix**: Implementing a standard focus trap hook (`useFocusTrap`) to track Tab/Shift-Tab keypresses and handle focus wrapping/restoring ensures full keyboard accessibility for the Checkout Modal.

---

## 3. Caveats

- **CSS Selectors**: The E2E tests in `e2e/tests/` rely on specific CSS classes (e.g., `.step-active`, `.step-content-2`, `.founder-bio`, `.btn-submit`) and attributes (e.g., `data-step="X"`, `data-testid="founder-image"`). Decomposing the file into separate components must strictly preserve these selectors to prevent test failures.
- **Scroll Physics**: Using Framer Motion's `useScroll` with container refs may shift the scroll offset boundaries slightly depending on margins and padding. The target ref should be carefully bound to the `sticky-wrapper` or the main section element, and offset options should be set to `["start start", "end end"]` to match the exact `0` to `1` range.
- **CSS Transitions**: Transition effects in vanilla CSS (defined in `globals.css`) may overlap with Framer Motion's inline style changes. Framer Motion properties should be kept minimal (focusing on opacity, y-offsets) to avoid conflicts with global styles.

---

## 4. Refactoring Strategy (Conclusion & Proposed Code)

### Step 1: Decompose `src/app/page.tsx`
Create five new self-contained components in `src/components/`:
- `src/components/Hero.tsx`
- `src/components/HowItWorks.tsx`
- `src/components/AboutUs.tsx`
- `src/components/Pricing.tsx` (includes the checkout modal)
- `src/components/ContactUs.tsx`

`src/app/page.tsx` will become a clean coordinator shell:
```typescript
"use client";

import React from "react";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import AboutUs from "@/components/AboutUs";
import Pricing from "@/components/Pricing";
import ContactUs from "@/components/ContactUs";

export default function Home() {
  return (
    <main className="main-content">
      <Hero />
      <HowItWorks />
      <AboutUs />
      <Pricing />
      <ContactUs />
    </main>
  );
}
```

### Step 2: Implement `src/components/HowItWorks.tsx` with Framer Motion
```typescript
"use client";

import React, { useState, useRef } from "react";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";

interface Step {
  id: number;
  title: string;
  description: string;
  className: string;
  label: string;
}

const STEPS: Step[] = [
  { 
    id: 0, 
    title: "Step 0: System Idle", 
    description: "EcoSplit AI is connected to your smart meter and stands ready. Scroll down to activate data collection.",
    className: "",
    label: "0. Connection"
  },
  { 
    id: 1, 
    title: "Step 1: Smart Data Gathering", 
    description: "Our agent collects real-time grid consumption, weather forecasts, and historical appliance usage metrics.",
    className: "",
    label: "1. Gathering"
  },
  { 
    id: 2, 
    title: "Step 2: Load Splitting Analysis", 
    description: "EcoSplit's neural engine analyzes your high-load vs low-load demands, dividing them into optimal buckets.",
    className: "step-content-2",
    label: "2. Analysis"
  },
  { 
    id: 3, 
    title: "Step 3: Real-Time Execution", 
    description: "The system dynamically reroutes non-essential loads to off-peak periods, generating immediate cost savings.",
    className: "",
    label: "3. Splitting"
  },
  { 
    id: 4, 
    title: "Step 4: AI Co-Pilot & Chatbot Control", 
    description: "Interact with our intelligent LLM Co-Pilot to override load limits, request forecasts, or check savings via natural language.",
    className: "final-state",
    label: "4. AI Co-Pilot"
  }
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Math safety: ensure no NaN/Infinity from useScroll outputs
    const progress = isNaN(latest) ? 0 : Math.max(0, Math.min(1, latest));
    const step = Math.floor(progress * 4.99);
    setActiveStep(step);
  });

  return (
    <section id="how-it-works" className="section-how-it-works" ref={containerRef}>
      <div className="sticky-wrapper" style={{ height: "400vh" }}>
        <div className="sticky-content">
          <div className="container">
            <div className="how-it-works-header">
              <h2>How EcoSplit AI Works</h2>
              <p>Scroll down to visualize the step-by-step energy splitting algorithm in real-time.</p>
            </div>

            <div className="how-it-works-grid">
              {/* Left side: Animated Step content display */}
              <div className="demo-display glass-card">
                <div className="step-contents">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={`step-pane active ${STEPS[activeStep].className}`}
                      data-step={activeStep}
                    >
                      <h3>{STEPS[activeStep].title}</h3>
                      <p>{STEPS[activeStep].description}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Right side: Indicators and progress */}
              <div className="demo-controls">
                <div className="step-indicators">
                  {STEPS.map((step) => (
                    <div 
                      key={step.id} 
                      className={`step-indicator ${activeStep === step.id ? "step-active" : ""}`}
                      data-step={step.id}
                    >
                      <div className="step-indicator-dot"></div>
                      <span className="step-indicator-text">{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className="scroll-prompt">
                  <span className="scroll-prompt-text">Scroll to progress</span>
                  <div className="scroll-cue"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Step 3: Implement WebGL Try-Catch and Math Safety in `src/hooks/useWebGL.ts`
Modify the `useEffect` inside `useWebGL.ts` to capture device compatibility issues and enforce clean arithmetic calculations:
```typescript
    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;

    try {
      const scene = new THREE.Scene();
      
      // Safety: Prevent divide-by-zero on aspect ratio calculation
      const aspect = window.innerHeight > 0 ? window.innerWidth / window.innerHeight : 1;
      const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // ... Geometry creation (as before) ...
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("random", new THREE.BufferAttribute(randoms, 3));

      // ... Shader material initialization ...
      material = new THREE.ShaderMaterial({ ... });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const mouse = new THREE.Vector2(0, 0);
      const targetMouse = new THREE.Vector2(0, 0);

      const handleMouseMove = (event: MouseEvent) => {
        // Safety: Ensure window size is positive
        const w = window.innerWidth > 0 ? window.innerWidth : 1;
        const h = window.innerHeight > 0 ? window.innerHeight : 1;
        targetMouse.x = (event.clientX / w) * 2 - 1;
        targetMouse.y = -(event.clientY / h) * 2 + 1;
      };

      let targetScroll = 0;
      const handleScroll = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        // Safety: Prevent division by zero/NaN when page height <= viewport height
        targetScroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("scroll", handleScroll);

      // ... Theme Observer & Resize logic ...
      const handleResize = () => {
        const curAspect = window.innerHeight > 0 ? window.innerWidth / window.innerHeight : 1;
        camera.aspect = curAspect;
        camera.updateProjectionMatrix();
        renderer?.setSize(window.innerWidth, window.innerHeight);
        renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };
      window.addEventListener("resize", handleResize);

      // ... Animation Loop ...
      const clock = new THREE.Clock();
      const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        uniforms.uTime.value = elapsedTime;

        mouse.x += (targetMouse.x - mouse.x) * 0.08;
        mouse.y += (targetMouse.y - mouse.y) * 0.08;
        uniforms.uMouse.value.copy(mouse);

        uniforms.uScroll.value += (targetScroll - uniforms.uScroll.value) * 0.1;
        uniforms.uThemeMode.value += (targetThemeMode - uniforms.uThemeMode.value) * 0.06;

        points.rotation.y = elapsedTime * 0.02;
        points.rotation.x = elapsedTime * 0.01;

        renderer?.render(scene, camera);
        requestRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
        if (observerRef.current) observerRef.current.disconnect();
        if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);

        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
      };
    } catch (error) {
      console.warn("WebGL initialization failed. Render background disabled.", error);
      // Return empty teardown callback to prevent errors
      return () => {};
    }
```

### Step 4: Implement Accessibility Focus Trap Hook `useFocusTrap`
Create a helper hook `src/hooks/useFocusTrap.ts` to manage overlay modals:
```typescript
import { useEffect, useRef } from "react";

export function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      const modalElement = modalRef.current;
      if (modalElement) {
        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = modalElement.querySelectorAll(focusableSelector);
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          modalElement.focus();
        }
      }
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(modalElement.querySelectorAll(focusableSelector)) as HTMLElement[];
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return modalRef;
}
```

---

## 5. Verification Method

To verify the refactored code successfully fixes the issues:
1. **Component Structure Check**: Inspect that `src/components/Hero.tsx`, `HowItWorks.tsx`, `AboutUs.tsx`, and `ContactUs.tsx` are correctly written and imported in `src/app/page.tsx`.
2. **Execute E2E Playwright Suite**:
   ```bash
   node e2e/runner.js
   ```
   All 63 test cases must pass successfully. 
   - Check that `e2e/tests/how-it-works.spec.js` transitions step states 0 to 4 upon scroll simulating.
   - Check that `e2e/tests/theme.spec.js` and WebGL tests pass under headless test execution (confirming that the `try-catch` prevents browser crash and fallback executes correctly).
   - Check keyboard-only page traversal (`e2e/tests/scenarios.spec.js` Case 59: Full Keyboard Accessibility Run) to verify that the focus stays locked to the modal upon opening, closes on Escape, and returns to the "Upgrade Now" button on exit.
