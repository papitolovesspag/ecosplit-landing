"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    id: 0,
    title: "Step 0: System Idle",
    description: "EcoSplit AI is connected to your smart meter and stands ready. It quietly monitors your baseline consumption before engaging.",
    image: "/assets/step_0_idle_1781738614781.png"
  },
  {
    id: 1,
    title: "Step 1: Smart Data Gathering",
    description: "Our agent collects real-time grid consumption, weather forecasts, and historical appliance usage metrics.",
    image: "/assets/step_1_gather_1781738625679.png"
  },
  {
    id: 2,
    title: "Step 2: Load Splitting Analysis",
    description: "EcoSplit's neural engine analyzes your high-load vs low-load demands, dividing them into optimal buckets.",
    image: "/assets/step_2_split_1781738643829.png"
  },
  {
    id: 3,
    title: "Step 3: Real-Time Execution",
    description: "The system dynamically reroutes non-essential loads to off-peak periods, generating immediate cost savings.",
    image: "/assets/step_3_execute_1781738661063.png"
  },
  {
    id: 4,
    title: "Step 4: AI Co-Pilot & Chatbot Control",
    description: "Interact with our intelligent LLM Co-Pilot to override load limits, request forecasts, or check savings via natural language.",
    image: "/assets/step_4_ai_1781738677380.png"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-how-it-works progressive">
      <div className="container">
        <div className="how-it-works-header">
          <h2>How EcoSplit AI Works</h2>
          <p>Scroll down to discover our step-by-step progressive energy splitting algorithm.</p>
        </div>

        <div className="progressive-steps-container">
          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`progressive-step-card glass-card ${index % 2 === 0 ? "row-normal" : "row-reverse"}`}
            >
              <div className="progressive-step-image">
                <img src={step.image} alt={step.title} />
              </div>
              <div className="progressive-step-content">
                <div className="step-number">0{index}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
