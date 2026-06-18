"use client";

import React, { useState, useEffect, useRef } from "react";
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion";

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bind scroll progress of the 400vh sticky wrapper
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Track initial scroll position on mount to prevent mismatch/stuck state
  useEffect(() => {
    if (mounted) {
      const currentProgress = scrollYProgress.get();
      if (currentProgress !== undefined && !isNaN(currentProgress)) {
        const step = Math.floor(currentProgress * 4.99);
        setActiveStep(Math.max(0, Math.min(4, step)));
      }
    }
  }, [mounted, scrollYProgress]);

  // Listen to progress updates and map to step 0-4
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Prevent division-by-zero or NaN consequences when calculating progress
    if (latest === undefined || isNaN(latest)) {
      setActiveStep(0);
      return;
    }
    const step = Math.floor(latest * 4.99);
    setActiveStep(Math.max(0, Math.min(4, step)));
  });

  return (
    <section id="how-it-works" className="section-how-it-works">
      <div ref={containerRef} className="sticky-wrapper" style={{ height: "400vh" }}>
        <div className="sticky-content">
          <div className="container">
            <div className="how-it-works-header">
              <h2>How EcoSplit AI Works</h2>
              <p>Scroll down to visualize the step-by-step energy splitting algorithm in real-time.</p>
            </div>

            <div className="how-it-works-grid">
              {/* Left side: Animated/Static Step content display */}
              <div className="demo-display glass-card">
                <div className="step-contents" style={{ position: "relative", minHeight: "150px" }}>
                  {!mounted ? (
                    // SSR / initial static render: render step 0 with full opacity to prevent blank content
                    <div className="step-pane active" data-step="0">
                      <h3>Step 0: System Idle</h3>
                      <p>EcoSplit AI is connected to your smart meter and stands ready. Scroll down to activate data collection.</p>
                    </div>
                  ) : (
                    // Client-side: render animated Framer Motion version
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className={`step-pane active step-content-${activeStep} ${activeStep === 4 ? "final-state" : ""}`}
                        data-step={activeStep}
                      >
                        {activeStep === 0 && (
                          <>
                            <h3>Step 0: System Idle</h3>
                            <p>EcoSplit AI is connected to your smart meter and stands ready. Scroll down to activate data collection.</p>
                          </>
                        )}
                        {activeStep === 1 && (
                          <>
                            <h3>Step 1: Smart Data Gathering</h3>
                            <p>Our agent collects real-time grid consumption, weather forecasts, and historical appliance usage metrics.</p>
                          </>
                        )}
                        {activeStep === 2 && (
                          <>
                            <h3>Step 2: Load Splitting Analysis</h3>
                            <p>EcoSplit&apos;s neural engine analyzes your high-load vs low-load demands, dividing them into optimal buckets.</p>
                          </>
                        )}
                        {activeStep === 3 && (
                          <>
                            <h3>Step 3: Real-Time Execution</h3>
                            <p>The system dynamically reroutes non-essential loads to off-peak periods, generating immediate cost savings.</p>
                          </>
                        )}
                        {activeStep === 4 && (
                          <>
                            <h3>Step 4: AI Co-Pilot & Chatbot Control</h3>
                            <p>Interact with our intelligent LLM Co-Pilot to override load limits, request forecasts, or check savings via natural language.</p>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Right side: Indicators and progress */}
              <div className="demo-controls">
                <div className="step-indicators">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`step-indicator ${activeStep === step ? "step-active" : ""}`}
                      data-step={step}
                    >
                      <div className="step-indicator-dot"></div>
                      <span className="step-indicator-text">
                        {step === 0 && "0. Connection"}
                        {step === 1 && "1. Gathering"}
                        {step === 2 && "2. Analysis"}
                        {step === 3 && "3. Splitting"}
                        {step === 4 && "4. AI Co-Pilot"}
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
