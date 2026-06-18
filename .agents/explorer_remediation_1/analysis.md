# Refactoring Analysis and Remediation Strategy

This report details the analysis of integrity violations and edge cases on the EcoSplit AI landing page. It recommends a clear, file-by-file refactoring plan to bring the project into layout compliance, adopt the required `framer-motion` scroll animations, and resolve identified edge cases (WebGL crash, division-by-zero, and focus trap).

---

## 1. Executive Summary

Our investigation of the codebase confirms that:
* **Integrity Violation 1 (Technology Bypass):** The step-by-step animations in the "How It Works" section are driven by a manual scroll event listener on `window` and raw element dimensions instead of `framer-motion` Hooks (`useScroll`, `useTransform`).
* **Integrity Violation 2 (Layout Compliance Failure):** No separate section components (`Hero.tsx`, `HowItWorks.tsx`, `AboutUs.tsx`, `ContactUs.tsx`) or reusable UI primitives (`ui/` folder) exist. All markup and state are currently inlined inside a single monolithic page component `src/app/page.tsx` (438 lines).
* **Edge Case 3 (WebGL Initialization Crash):** `THREE.WebGLRenderer` in `src/hooks/useWebGL.ts` lacks try-catch protection. In environments without WebGL (e.g. headless browsers, legacy hardware), it throws a fatal exception that crashes the application's page rendering.
* **Edge Case 4 (Scroll Division-by-Zero):** The scroll progress logic in `page.tsx` divides scroll position by `(sectionHeight - window.innerHeight)`. If these values are equal, the denominator is `0`, producing `NaN` progress, which breaks state transitions and hides interactive elements.
* **Edge Case 5 (Focus Trap):** The pricing upgrade checkout modal does not trap keyboard focus, allowing users to press `Tab` and navigate background page links while the modal is active.

We propose a full refactoring of the codebase structure and animations. Below is the file-by-file plan.

---

## 2. File-by-File Refactoring Plan

### 2.1 UI Folder (`src/components/ui/`)

To comply with layout guidelines in `PROJECT.md`, we will extract layout structures and recurring primitives into a dedicated `ui/` directory.

#### File: `src/components/ui/Card.tsx`
* **Purpose:** A reusable component representing the glassmorphic card container with neon-accent highlights.
* **Code Implementation Sketch:**
  ```tsx
  import React from "react";

  interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
  }

  export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
    return (
      <div className={`glass-card ${className}`} {...props}>
        {children}
      </div>
    );
  };
  ```

#### File: `src/components/ui/Modal.tsx`
* **Purpose:** A reusable modal overlay component implementing a secure keyboard focus trap.
* **Focus Trap Logic:** It implements a custom React hook `useFocusTrap` (detailed in Section 3) to lock Tab/Shift+Tab movement and intercept the Escape key to trigger closing.
* **Code Implementation Sketch:**
  ```tsx
  import React, { useEffect, useRef } from "react";

  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }

  export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (!isOpen) return;

      // Save focus target to restore later
      previousFocusRef.current = document.activeElement as HTMLElement;

      const modal = modalRef.current;
      if (!modal) return;

      // Select focusable elements
      const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (e.key === "Tab") {
          if (focusableElements.length === 0) return;
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className="checkout-modal-overlay" onClick={onClose}>
        <div 
          className="checkout-modal glass-card" 
          ref={modalRef} 
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h3 id="modal-title">{title}</h3>
          {children}
        </div>
      </div>
    );
  };
  ```

---

### 2.2 Main Components Folder (`src/components/`)

We will split the massive `src/app/page.tsx` file into distinct, clean section components.

#### File: `src/components/Hero.tsx`
* **Purpose:** Renders the landing page title, subtitle, and primary call-to-action buttons, along with the Glassmorphic Active Load Split dashboard card.
* **Key Content:** Inlined from lines 71–121 of current `page.tsx`.

#### File: `src/components/HowItWorks.tsx`
* **Purpose:** Implements the scroll-controlled step-by-step product walkthrough using `framer-motion` components to drive state transitions rather than a raw window scroll listener.
* **Framer Motion Setup:**
  - Uses `useScroll` with a `ref` pointed to the sticky outer wrapper container (`height: 400vh`).
  - Uses `useTransform` to translate scroll progress `[0, 1]` to step indices `[0, 4.99]` to map to the 5 states (0 through 4).
  - Uses `useMotionValueEvent` to update React local state when scroll changes, updating step texts and highlights.
  - Incorporates `AnimatePresence` and `motion.div` to smoothly animate step content changes.
* **Code Implementation Sketch:**
  ```tsx
  import React, { useRef, useState } from "react";
  import { useScroll, useTransform, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";

  const STEPS = [
    { id: 0, title: "Step 0: System Idle", text: "EcoSplit AI is connected to your smart meter and stands ready. Scroll down to activate data collection." },
    { id: 1, title: "Step 1: Smart Data Gathering", text: "Our agent collects real-time grid consumption, weather forecasts, and historical appliance usage metrics." },
    { id: 2, title: "Step 2: Load Splitting Analysis", text: "EcoSplit's neural engine analyzes your high-load vs low-load demands, dividing them into optimal buckets." },
    { id: 3, title: "Step 3: Real-Time Execution", text: "The system dynamically reroutes non-essential loads to off-peak periods, generating immediate cost savings." },
    { id: 4, title: "Step 4: AI Co-Pilot & Chatbot Control", text: "Interact with our intelligent LLM Co-Pilot to override load limits, request forecasts, or check savings via natural language." }
  ];

  const STEP_NAMES = [
    "0. Connection",
    "1. Gathering",
    "2. Analysis",
    "3. Splitting",
    "4. AI Co-Pilot"
  ];

  export default function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);

    // Frame Motion Scroll Hook
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end end"],
    });

    // Translate scroll progress from 0-1 to step range 0-4.99
    const stepProgress = useTransform(scrollYProgress, [0, 1], [0, 4.99]);

    // Update local state reactively to drive DOM styles and step contents
    useMotionValueEvent(stepProgress, "change", (latest) => {
      const step = Math.floor(latest);
      setActiveStep(Math.max(0, Math.min(4, step)));
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
                {/* Left Side: Smooth animated content panel */}
                <div className="demo-display glass-card">
                  <div className="step-contents">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="step-pane active"
                        data-step={activeStep}
                      >
                        <h3>{STEPS[activeStep].title}</h3>
                        <p>{STEPS[activeStep].text}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Side: Step Progress Indicators */}
                <div className="demo-controls">
                  <div className="step-indicators">
                    {STEPS.map((step) => (
                      <div
                        key={step.id}
                        className={`step-indicator ${activeStep === step.id ? "step-active" : ""}`}
                        data-step={step.id}
                      >
                        <div className="step-indicator-dot"></div>
                        <span className="step-indicator-text">
                          {STEP_NAMES[step.id]}
                        </span>
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

#### File: `src/components/AboutUs.tsx`
* **Purpose:** Highlights our company mission statement, brand statistics, and features the founder's bio card with an expandable full-bio details container.
* **State Managed:** `bioExpanded` boolean.
* **Key Content:** Inlined from lines 203–268 of current `page.tsx`.

#### File: `src/components/Pricing.tsx`
* **Purpose:** Displays the transparent subscription tiers, featuring the monthly-vs-yearly slider switch, neon hovered border styles, upgrade action button, and triggers the confirmation modal.
* **State Managed:** `billingCycle` ("monthly" | "yearly") and `showCheckoutModal` (boolean).
* **Key Content:** Inlined from lines 270–327 and checkout overlay 416–434 of current `page.tsx`.
* **Refactoring Note:** Incorporates `<Modal>` from `src/components/ui/Modal.tsx`.

#### File: `src/components/ContactUs.tsx`
* **Purpose:** Contact form capturing name, email, and message inputs with standard browser validations, error feedback borders, and post-submission animation panel.
* **State Managed:** `formSubmitted` (boolean) and `formData` (name, email, message object).
* **Key Content:** Inlined from lines 329–413 of current `page.tsx`.

---

### 2.3 Main Landing Page (`src/app/page.tsx`)

#### File: `src/app/page.tsx`
* **Purpose:** Clean, unified entry point that imports and stacks all section components. No local UI state or animation listeners are handled at this level, drastically reducing complexity.
* **Code Implementation:**
  ```tsx
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

---

### 2.4 WebGL Hook (`src/hooks/useWebGL.ts`)

#### File: `src/hooks/useWebGL.ts`
* **Purpose:** Custom Hook handling scene setup, shaders, mouse-tracking uniforms, and resize observers.
* **Refactoring Action:** Add try-catch block to wrap the `WebGLRenderer` construction to gracefully swallow unsupported WebGL issues.
* **Code Modification:**
  ```typescript
  // Inside useEffect loop in useWebGL:
  const canvas = canvasRef.current;
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
  } catch (error) {
    console.warn("WebGL is not supported in this client environment. Custom canvas background disabled.", error);
    // Exit early, skipping particle buffers, uniforms, listeners, and the requestAnimationFrame loop.
    return;
  }
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Proceed with Particle geometry initialization...
  ```

---

## 3. Analysis of Edge Cases & Solutions

### 3.1 WebGL Renderer Crash Prevention
* **Root Cause:** If a client browser or simulation container disables GPU acceleration, does not implement WebGL API context, or fails to fetch GPU profiles, calling `new THREE.WebGLRenderer()` immediately crashes execution with a fatal stack trace.
* **Prevention Strategy:** Wrapping this block in a try-catch statement halts the Hook execution safely and exits `useEffect` before registering animators, geometries, and global event listeners. This leaves the canvas transparent, and the user can see standard styling/gradients without crashing the React page.

### 3.2 Scroll Division-by-Zero Protection
* **Root Cause:** High-resolution or portrait viewport rendering (e.g. mobile emulation sizes or full-page reports) can lead to elements where `sectionHeight === window.innerHeight`. In the original logic, this creates `scrollPos / 0`, yielding `NaN`. When assigned to active steps, it fails to match numeric step indices (0-4), preventing content from updating or rendering.
* **Prevention Strategy:** Replacing the custom listener with Framer Motion's `useScroll` leverages viewport calculations. If custom math checks are ever required, we explicitly clamp the divisor:
  ```typescript
  const divisor = sectionHeight - window.innerHeight;
  const progress = divisor > 0 ? scrollPos / divisor : 0;
  ```

### 3.3 Keyboard Focus Trap in Checkout Modal
* **Root Cause:** A modal overlay blocks standard visual interaction but fails to block keyboard focus. Keyboard users pressing `Tab` can cycle focus straight out of the modal background onto text boxes or contact buttons, causing confusion and accessibility failures.
* **Prevention Strategy:** The refactored `Modal` handles focus:
  1. Activates keydown listener only when `isOpen` is true.
  2. Queries all interactives (buttons, inputs) inside the modal container.
  3. Overrides the `Tab` event when focus hits the first or last element, wrapping it.
  4. Escapes and closes the modal cleanly when the `Escape` key is pressed.
  5. Restores focus back to the triggering element (e.g. "Upgrade Now" button) upon closing.
