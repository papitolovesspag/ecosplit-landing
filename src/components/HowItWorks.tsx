"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const steps = [
  {
    id: 0,
    title: "Step 0: System Idle",
    description: "Instant Cloud Telemetry Sync: Connect your smart meter, battery inverter (Enphase, SolarEdge, Tesla), or utility AMI via zero-touch OAuth and REST Webhooks.",
    image: "/assets/step_0_idle_1781738614781.png"
  },
  {
    id: 1,
    title: "Step 1: Smart Data Gathering",
    description: "High-Frequency Grid Telemetry Ingestion: Continuously streams real-time ISO locational marginal pricing (LMP), grid carbon intensity, and microinverter telemetry.",
    image: "/assets/step_1_gather_1781738625679.png"
  },
  {
    id: 2,
    title: "Step 2: Load Splitting Analysis",
    description: "Time-Series Neural Forecasting: Deep sequence models compute 24-hour ahead peak load probabilities with <120ms inference latency.",
    image: "/assets/step_2_split_1781738643829.png"
  },
  {
    id: 3,
    title: "Step 3: Real-Time Execution",
    description: "Autonomous Tariff Arbitrage Execution: Automated dispatch triggers battery discharge during peak tariff spikes and shifts deferrable loads to negative-cost windows.",
    image: "/assets/step_3_execute_1781738661063.png"
  },
  {
    id: 4,
    title: "Step 4: AI Co-Pilot & Chatbot Control",
    description: "Autonomous LLM Co-Pilot Orchestrator: Command-line and conversational dispatch for operations teams to execute demand-response events, inspect anomalies, and configure OpenADR rules.",
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
          
          {/* Step indicators container with step dots (Case 13) */}
          <div className="step-indicators-container">
            <div className="step-indicators">
              {steps.map((s, idx) => (
                <div key={s.id} className={`step-dot ${idx === 0 ? "step-active" : ""}`} title={s.title}>
                  <span className="dot-number">{idx}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual scroll cue / prompt (Case 15) */}
          <div className="scroll-prompt scroll-cue">
            <span className="scroll-mouse-icon"></span>
            <span>Scroll through 5-step neural split sequence</span>
          </div>
        </div>

        {/* Sticky wrapper container (Case 16) */}
        <div className="sticky-wrapper progressive-steps-container" style={{ minHeight: "400vh" }}>
          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              data-step={step.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`progressive-step-card glass-card ${step.id === 4 ? "step-chatbot chatbot" : ""} ${index % 2 === 0 ? "row-normal" : "row-reverse"}`}
            >
              <div className="progressive-step-image">
                <img src={step.image} alt={step.title} />
              </div>
              <div className={`progressive-step-content step-content-${step.id}`}>
                <div className="step-number">0{index}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="how-it-works-cta-bottom text-center">
          <Link href="/demo" className="btn-cta btn-primary">
            Try Interactive Simulator Now <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
