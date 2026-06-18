# Analysis Report — EcoSplit AI Landing Page Remediation

## Executive Summary
This report proposes a detailed refactoring strategy to remediate code integrity, layout, robustness, and accessibility issues on the EcoSplit AI landing page. The strategy decomposes `src/app/page.tsx` into modular components matching `PROJECT.md`, replaces manual scroll listeners with Framer Motion, protects the WebGL rendering thread from crashes, and secures the modal with an accessible focus trap.

---

## 1. Current State Analysis
Upon investigation, the following issues were identified:
- **Layout Violation**: `src/app/page.tsx` contains the entire landing page inline, including the Hero, How It Works, About Us, Pricing, and Contact Us sections. This violates the modular code architecture specified in `PROJECT.md`.
- **Animation Bypass**: The scroll-driven steps in "How It Works" are handled via a raw React state window scroll listener (`window.addEventListener("scroll", ...)`), entirely bypassing the required `framer-motion` implementation.
- **Division-by-Zero Risk**: The manual scroll step calculations divide the scroll offset by `sectionHeight - window.innerHeight` without checking if the denominator is `<= 0`. If the container height is equal to or less than the viewport height, this calculation yields `Infinity` or `NaN`.
- **WebGL Crash Risk**: In `src/hooks/useWebGL.ts`, `new THREE.WebGLRenderer(...)` is initialized without error handling. On devices/browsers without WebGL support, this throws a fatal exception that crashes the entire React lifecycle.
- **Accessibility/A11y Deficit**: The Upgrade Checkout Modal lacks keyboard focus trapping, allowing users to tab out of the modal to hidden background elements, and fails to restore focus to the triggering element upon closing.

---

## 2. Component Decomposition Plan

To comply with `PROJECT.md`, `src/app/page.tsx` must be refactored into a clean page aggregator that simply imports and renders the individual section components.

### Proposed Code Directory Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx          # Aggregator page
│   └── globals.css
├── components/
│   ├── WebGLBackground.tsx
│   ├── ClientWebGLBackground.tsx
│   ├── Navbar.tsx
│   ├── Hero.tsx          # New: Ported from page.tsx (lines 71-121)
│   ├── HowItWorks.tsx    # New: Ported from page.tsx (lines 123-200)
│   ├── AboutUs.tsx       # New: Ported from page.tsx (lines 202-268)
│   ├── Pricing.tsx       # New: Ported from page.tsx (lines 270-326)
│   ├── ContactUs.tsx     # New: Ported from page.tsx (lines 328-413)
│   └── ui/               # Future: Reusable UI primitives
└── hooks/
    └── useWebGL.ts
```

### Component Breakdown & Interface Contracts

#### 1. `src/components/Hero.tsx`
- **Responsibilities**: Renders the value proposition title, subtitles, action CTAs, and the visual dashboard card (lines 71–121).
- **E2E Markers**: Must retain the element ID `#hero` and classes like `.hero-grid`, `.hero-text`, `.hero-visual`, `.btn-primary`, and `.btn-secondary`.

#### 2. `src/components/HowItWorks.tsx`
- **Responsibilities**: Implements the scroll-controlled step-by-step interactive product demo (lines 123–200) powered by Framer Motion.
- **E2E Markers**: Must retain `#how-it-works`, `.sticky-wrapper`, `.step-indicator`, `.step-active`, and `data-step` attributes (0 to 4) on active step panes to prevent E2E test failures (specifically `Case 17` through `Case 20`).

#### 3. `src/components/AboutUs.tsx`
- **Responsibilities**: Renders the mission card and founder profile including bio toggle (lines 202–268).
- **Props/State**: Local state `bioExpanded` managed internally.
- **E2E Markers**: Must retain `#about-us`, `.founder-profile`, `data-testid="mission-statement"`, `data-testid="founder-image"`, `data-testid="founder-bio"`, and `.read-more-btn`.

#### 4. `src/components/ContactUs.tsx`
- **Responsibilities**: Renders the contact details and contact form (lines 328–413).
- **Props/State**: Form data inputs (`name`, `email`, `message`) and submission feedback state (`formSubmitted`) managed locally.
- **E2E Markers**: Must retain `#contact-us`, `form#contact-form`, input element names/IDs (`name-input`, `email-input`, `message-input`), and the `.success-message` feedback container.

#### 5. `src/components/Pricing.tsx` (Including Checkout Modal)
- **Responsibilities**: Renders pricing tiers, the billing cycle toggle (monthly/yearly), and mounts the Checkout Modal (lines 270–326 and 415–434).
- **Props/State**: Manages `billingCycle` and `showCheckoutModal` states. Invokes the focus-trapped `CheckoutModal` component.
- **E2E Markers**: Must retain `#pricing`, `button#billing-toggle`, `.pricing-card`, `.price`, and `.checkout-modal`.

#### Aggregated `src/app/page.tsx` Implementation
Once decomposed, `page.tsx` becomes highly clean:
```typescript
"use client";

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

---

## 3. Framer Motion Scroll Integration Strategy

Instead of using the manual state scroll listener in `page.tsx` (lines 34–53), we will integrate Framer Motion hooks and motion components inside `src/components/HowItWorks.tsx`.

### Scroll Hook Implementation
We will bind `useScroll` to a reference pointing to the sticky outer wrapper container (`.sticky-wrapper`). We then LERP the progress value into our step indexing.

```typescript
import React, { useState, useRef } from "react";
import { useScroll, useMotionValueEvent, useTransform, AnimatePresence, motion } from "framer-motion";

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Bind scroll progress to the sticky container height (400vh)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Track changes to drive activeStep state
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 1. Defend against NaN or undefined values
    if (isNaN(latest) || latest === undefined) {
      setActiveStep(0);
      return;
    }
    
    // 2. Map progress from 0.0-1.0 range into step indices 0-4
    // Utilizing Math.max and Math.min guarantees bounding
    const step = Math.floor(latest * 4.99);
    setActiveStep(Math.max(0, Math.min(4, step)));
  });

  return (
    <section id="how-it-works" className="section-how-it-works">
      <div ref={containerRef} className="sticky-wrapper" style={{ height: "400vh" }}>
        <div className="sticky-content">
          {/* ... section layout ... */}
          
          <div className="how-it-works-grid">
            <div className="demo-display glass-card">
              <div className="step-contents">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className={`step-pane active step-content-${activeStep}`}
                    data-step={activeStep}
                  >
                    {activeStep === 0 && (
                      <>
                        <h3>Step 0: System Idle</h3>
                        <p>EcoSplit AI is connected to your smart meter and stands ready...</p>
                      </>
                    )}
                    {activeStep === 1 && (
                      <>
                        <h3>Step 1: Smart Data Gathering</h3>
                        <p>Our agent collects real-time grid consumption, weather forecasts...</p>
                      </>
                    )}
                    {/* ... Steps 2, 3, and 4 ... */}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Step Indicators and Scroll Cues */}
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Addressing Division-by-Zero & NaN
The current scroll calculation divides by `sectionHeight - window.innerHeight` directly in:
`scrollPos / (sectionHeight - window.innerHeight)`
By migrating to Framer Motion's `useScroll`, the library manages the viewport bounds internally. However, if the element's height is extremely small or zero, Framer Motion can emit `NaN`. We resolve this by:
1. Enforcing a fallback `0` if `latest` is `NaN` or `undefined`.
2. Encapsulating the output with `Math.max(0, Math.min(4, step))` to protect against overflow/underflow.

---

## 4. WebGL Safety & Robustness (useWebGL.ts)

To prevent crash failures on devices without full WebGL rendering support (e.g. headless CI environments, older mobile devices), we implement exception handling in `src/hooks/useWebGL.ts`.

### Proposed Try-Catch Refactoring
```typescript
export function useWebGL(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const requestRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Wrapped WebGLRenderer initialization
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch (error) {
      console.warn("WebGL initialization failed. Abstract background disabled.", error);
      // Exit early. No event listeners, observers, or requestAnimationLoops are established.
      // This protects the host page from failing to mount completely.
      return;
    }

    // Initialize Scene, Camera, and other elements only if renderer succeeded
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Handle context loss events gracefully
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      console.warn("WebGL context lost. Animating loop suspended.");
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    // ... set up geometry, shaders, uniforms, and interactive listeners ...

    // Cleanup hook
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
```

---

## 5. Modal Focus Trap Strategy

To ensure optimal keyboard navigation accessibility (A11y), the `CheckoutModal` component needs a focus trap. We can implement this directly within the component's React lifecycle.

### Focus Trap Implementation in `CheckoutModal.tsx`
```typescript
import React, { useEffect, useRef } from "react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingCycle: "monthly" | "yearly";
}

export default function CheckoutModal({ isOpen, onClose, billingCycle }: CheckoutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 1. Cache the element that triggered the modal (e.g. the "Upgrade Now" button)
      triggerElementRef.current = document.activeElement as HTMLElement;

      // 2. Programmatically focus the modal element to begin the trap
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // 3. Tab trapping logic
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (e.key === "Tab") {
          if (!modalRef.current) return;

          // Query focusable candidates
          const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
          
          if (focusables.length === 0) return;

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            // Shift + Tab: Backwards traversal
            if (document.activeElement === firstEl) {
              lastEl.focus();
              e.preventDefault();
            }
          } else {
            // Tab: Forwards traversal
            if (document.activeElement === lastEl) {
              firstEl.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        // 4. Restore focus back to original button when modal closes
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="checkout-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-header-title"
    >
      <div 
        ref={modalRef}
        className="checkout-modal glass-card" 
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1} // Makes it focusable programmatically
        style={{ outline: "none" }}
      >
        <h3 id="modal-header-title">Confirm Upgrade</h3>
        <p>You selected the <strong>AI Premium</strong> plan ({billingCycle === "monthly" ? "$29/mo" : "$19/mo, billed annually"}).</p>
        <div className="checkout-actions">
          <button className="btn-cta btn-primary" onClick={() => {
            alert("Thank you for your purchase!");
            onClose();
          }}>
            Complete Checkout
          </button>
          <button className="btn-cta btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Verification Plan
To verify the remediated code meets all required specifications:
1. **Compilation Check**: Run the build script using `npm run build` or `next build` to verify there are no import or TypeScript errors across the refactored directory layout.
2. **WebGL Fallback Testing**: In a WebGL-disabled browser or headless environment, verify the page loads cleanly, and a warning is logged to the console rather than a fatal crash.
3. **Scroll Animation Check**: Scroll the page through the `#how-it-works` section and verify that step classes (`.step-active` and `[data-step]`) update sequentially.
4. **Modal Trap Check**: Open the modal, navigate using `Tab` and `Shift+Tab`. Ensure focus stays contained inside the modal and returns to the "Upgrade Now" button on exit.
5. **E2E Test Suite**: Run `node e2e/runner.js` to execute the Tier 1-4 Playwright test suites, confirming 100% test pass rate.
