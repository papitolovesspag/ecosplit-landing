"use client";

import React, { useState } from "react";
import {
  FiCpu,
  FiZap,
  FiTrendingUp,
  FiCheck,
  FiArrowRight,
  FiActivity,
  FiLayers,
  FiTerminal,
  FiSliders,
} from "react-icons/fi";
import Link from "next/link";

interface PipelineStage {
  id: string;
  step: string;
  name: string;
  shortDesc: string;
  tensorInput: string;
  latencyConstraint: string;
  details: string[];
}

const pipelineStages: PipelineStage[] = [
  {
    id: "ingestion",
    step: "01",
    name: "Data Ingestion",
    shortDesc: "Streaming multi-source telemetry & regional spot pricing",
    tensorInput: "Tensor [B, 96, 14] @ 1Hz Smart Meter (kW/kVAR)",
    latencyConstraint: "< 12 ms Kafka/WebSocket stream",
    details: [
      "Real-time ISO Locational Marginal Pricing (CAISO, ERCOT, PJM, NYISO)",
      "High-frequency smart meter active power (kW) & reactive power (kVAR)",
      "Local ambient temperature & direct normal solar irradiance APIs",
      "Battery state of charge (SoC) & cell degradation boundary constraints",
    ],
  },
  {
    id: "attention",
    step: "02",
    name: "Temporal Fusion Attention",
    shortDesc: "Multi-horizon cross-attention neural forecasting",
    tensorInput: "Cross-Attention Heads: 8 | Hidden Dim: 256",
    latencyConstraint: "< 34 ms TensorRT GPU / ONNX Edge",
    details: [
      "Multi-Horizon Temporal Fusion Transformer (TFT) with interpretable self-attention",
      "Dynamic variable selection networks filtering noisy microgrid telemetry",
      "Gated residual connections isolating long-term seasonal vs short-term tariff shock",
      "98.4% day-ahead peak demand and price spike probability prediction",
    ],
  },
  {
    id: "optimization",
    step: "03",
    name: "Real-Time Arbitrage Optimization",
    shortDesc: "Sub-120ms mixed-integer linear programming (MILP)",
    tensorInput: "Objective: min(Σ C_grid · P_grid + D_bat · deg)",
    latencyConstraint: "< 48 ms Branch-and-Cut MILP Solver",
    details: [
      "Continuous mixed-integer linear programming (MILP) solving in sub-120ms",
      "Dynamic battery electrochemical degradation curve preservation",
      "Peak demand surcharge abatement against utility peaker tariffs",
      "Provably optimal dispatch balance between grid import and BESS discharge",
    ],
  },
  {
    id: "dispatch",
    step: "04",
    name: "Automated Inverter Dispatch",
    shortDesc: "Deterministic hardware setpoint execution",
    tensorInput: "Setpoints: { target_kw: 6.35, throttle: 0.75 }",
    latencyConstraint: "< 24 ms Direct Inverter Webhook / Modbus",
    details: [
      "Sub-second encrypted setpoints transmitted to battery inverters",
      "Direct cloud & Modbus connectors for Tesla, Enphase, and SolarEdge gateways",
      "Certified OpenADR 2.0b VEN automated demand-response compliance",
      "Fail-safe fallback logic maintaining local microgrid stability on network timeout",
    ],
  },
];

interface CopilotScenario {
  id: string;
  label: string;
  query: string;
  functionCalled: string;
  response: string;
  attribution: {
    factor: string;
    weight: string;
  }[];
}

const copilotScenarios: CopilotScenario[] = [
  {
    id: "attribution",
    label: "Explain 14:00 Discharge",
    query: "Explain why the battery discharged at 14:00 instead of charging from solar.",
    functionCalled: "query_neural_attribution(timestamp='2026-10-28T14:00:00Z')",
    response:
      "At 14:00, CAISO LMP experienced an unanticipated spot spike to $0.62/kWh while localized cloud cover reduced solar irradiance by 64%. The TFT attention layer flagged a 94.1% peaker tariff probability. The MILP solver initiated a 6.35 kW discharge, avoiding $4.18 in peak demand charges within that 60-minute window while maintaining battery SoC above the 20% degradation floor.",
    attribution: [
      { factor: "ISO LMP Spot Tariff Surge ($0.62/kWh)", weight: "+58%" },
      { factor: "Solar Irradiance Drop (Cloud Vector)", weight: "+24%" },
      { factor: "Facility Baseline HVAC Surge (8.45 kW)", weight: "+14%" },
      { factor: "Battery SoC Degradation Cost Offset", weight: "-4%" },
    ],
  },
  {
    id: "override",
    label: "Hold 30% Storm Reserve",
    query: "Severe weather alert incoming. Hold 30% battery reserve and pause non-essential shedding.",
    functionCalled: "set_inverter_reserve(min_soc_pct=30, storm_mode=true, bypass_rules=true)",
    response:
      "Deterministic tool call executed successfully. Battery minimum reserve constraint updated from 15% to 30.0% in the real-time MILP optimizer. Dynamic tariff arbitrage will operate strictly between 30% and 100% SoC until storm watch expires at 08:00 tomorrow. Automated inverter setpoints refreshed across active gateways.",
    attribution: [
      { factor: "Manual Operator Override Triggered", weight: "Active" },
      { factor: "New BESS SoC Floor", weight: "30.0%" },
      { factor: "Estimated Emergency Reserve Capacity", weight: "13.5 kWh" },
      { factor: "Status", weight: "Synced across fleet" },
    ],
  },
  {
    id: "openadr",
    label: "OpenADR Demand Response",
    query: "Incoming OpenADR 2.0b moderate peak curtailment signal received. Dispatch load shed.",
    functionCalled: "dispatch_openadr_event(event_id='DR_2026_PEAK_04', target_shed_kw=4.5)",
    response:
      "OpenADR 2.0b VEN certified engine parsed utility payload. Shed target: 4.5 kW for 120 minutes. Dispatched 4.5 kW immediate battery substitution and deferred 1.8 kW of EV charging. Baseline grid import reduced from 8.45 kW to 2.15 kW. Full compliance report logged for utility reconciliation credit.",
    attribution: [
      { factor: "Utility Signal Type", weight: "OpenADR 2.0b DISTRIBUTE" },
      { factor: "Curtailed Grid Demand", weight: "4.50 kW" },
      { factor: "Earned Demand Response Credit", weight: "$18.40 / event" },
      { factor: "VEN Acknowledgment Latency", weight: "42 ms" },
    ],
  },
];

export default function Architecture() {
  const [activeTab, setActiveTab] = useState<"timeseries" | "llm">("timeseries");
  const [selectedStage, setSelectedStage] = useState<string>("attention");
  const [selectedCopilotScenario, setSelectedCopilotScenario] = useState<string>("attribution");

  const currentStage = pipelineStages.find((s) => s.id === selectedStage) || pipelineStages[1];
  const currentScenario =
    copilotScenarios.find((s) => s.id === selectedCopilotScenario) || copilotScenarios[0];

  return (
    <section id="architecture" className="section-architecture">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="badge-pill">
            <FiCpu className="badge-icon" />
            <span>PROPRIETARY DUAL-ENGINE AI PIPELINE</span>
          </div>
          <h2 className="section-title">
            Deep Time-Series Neural Forecasting &amp;{" "}
            <span>Autonomous LLM Grid Orchestrator</span>
          </h2>
          <p className="section-subtitle">
            EcoSplit AI bridges high-frequency grid edge telemetry with deep transformer forecasting and domain-adapted energy foundation models. Purpose-engineered for real-time ISO tariff arbitrage, commercial microgrids, and certified OpenADR utility response.
          </p>
        </div>

        {/* Real-Time Model Telemetry & Technical Specs Cards */}
        <div className="neural-specs-grid glass-card">
          <div className="spec-item">
            <div className="spec-val font-cyan">&lt; 118 ms</div>
            <div className="spec-label">P99 Inference Latency</div>
            <p className="spec-sub">Edge-accelerated neural dispatch on grid signal shifts</p>
          </div>
          <div className="spec-item">
            <div className="spec-val font-green">98.4%</div>
            <div className="spec-label">Day-Ahead Forecast Accuracy</div>
            <p className="spec-sub">Multi-horizon peak demand prediction</p>
          </div>
          <div className="spec-item">
            <div className="spec-val font-cyan">Up to 45%</div>
            <div className="spec-label">Peak Arbitrage Efficiency</div>
            <p className="spec-sub">Demonstrated peak demand charge reduction</p>
          </div>
          <div className="spec-item">
            <div className="spec-val font-green">OpenADR 2.0b</div>
            <div className="spec-label">Standard Compliance</div>
            <p className="spec-sub">Certified Virtual End Node / VEN standard</p>
          </div>
        </div>

        {/* Interactive Architecture Switcher / Dual Pipeline Tabs */}
        <div className="engine-tabs-wrapper">
          <div className="engine-tab-buttons">
            <button
              className={`engine-tab-btn ${activeTab === "timeseries" ? "active" : ""}`}
              onClick={() => setActiveTab("timeseries")}
              aria-label="View Time-Series Neural Forecasting Engine"
            >
              <FiTrendingUp className="tab-icon" />
              <span>Pipeline 1: Deep Time-Series Neural Forecasting &amp; Tariff Arbitrage</span>
            </button>
            <button
              className={`engine-tab-btn ${activeTab === "llm" ? "active" : ""}`}
              onClick={() => setActiveTab("llm")}
              aria-label="View Autonomous LLM Co-Pilot"
            >
              <FiZap className="tab-icon" />
              <span>Pipeline 2: Autonomous LLM Co-Pilot for Grid Orchestration</span>
            </button>
          </div>

          <div className="engine-display glass-card">
            {activeTab === "timeseries" ? (
              <div className="engine-content-grid">
                {/* Left Column: Description & Deep Technical Overview */}
                <div className="engine-text">
                  <div className="engine-badge">
                    <FiActivity /> Multi-Horizon Temporal Fusion Transformer (TFT)
                  </div>
                  <h3>Multi-Horizon Forecasting &amp; Mixed-Integer Arbitrage</h3>
                  <p>
                    Engineered for micro-second energy dynamics, our recurrent pipeline continuously correlates real-time ISO locational marginal pricing with high-frequency smart meter active and reactive power, local solar irradiance, and electrochemical degradation constraints.
                  </p>

                  <ul className="engine-feature-list">
                    <li>
                      <FiCheck className="check-icon font-green" />
                      <div>
                        <strong>Streaming Telemetry Ingestion:</strong> Ingests 1Hz active power (kW), reactive power (kVAR), real-time ISO LMP feeds (CAISO, ERCOT, PJM, NYISO), and ambient weather vectors.
                      </div>
                    </li>
                    <li>
                      <FiCheck className="check-icon font-green" />
                      <div>
                        <strong>Temporal Fusion Cross-Attention:</strong> Multi-horizon self-attention heads isolate long-term diurnal cycles from sudden spot tariff spikes to forecast load curves 24 hours ahead.
                      </div>
                    </li>
                    <li>
                      <FiCheck className="check-icon font-green" />
                      <div>
                        <strong>Sub-120ms MILP Solver:</strong> Real-time mixed-integer linear programming continuously balances battery degradation limits against tariff spreads to minimize peak demand surcharges.
                      </div>
                    </li>
                    <li>
                      <FiCheck className="check-icon font-green" />
                      <div>
                        <strong>Automated Hardware Dispatch:</strong> Delivers deterministic setpoints directly to Tesla, Enphase, and SolarEdge inverters with zero human intervention.
                      </div>
                    </li>
                  </ul>

                  <div className="engine-cta">
                    <Link href="/demo" className="btn-cta btn-primary">
                      Test Model in Live Simulator <FiArrowRight />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Interactive Data Pipeline Diagram */}
                <div className="engine-diagram">
                  <div className="diagram-card glass-panel">
                    <div className="diagram-header">
                      <div className="diagram-title">
                        <FiLayers className="font-cyan" />
                        <span>Interactive Data Pipeline Stages</span>
                      </div>
                      <span className="live-pulse-badge">
                        <span className="live-pulse-dot"></span> Sub-120ms Pipeline
                      </span>
                    </div>

                    <p className="diagram-instruction">
                      Click any pipeline stage below to inspect real-time tensor transformations:
                    </p>

                    {/* 4 Pipeline Stages Navigation */}
                    <div className="pipeline-steps-interactive">
                      {pipelineStages.map((stage) => (
                        <button
                          key={stage.id}
                          className={`pipe-stage-btn ${selectedStage === stage.id ? "active" : ""}`}
                          onClick={() => setSelectedStage(stage.id)}
                        >
                          <div className="pipe-stage-number">{stage.step}</div>
                          <div className="pipe-stage-info">
                            <span className="pipe-stage-name">{stage.name}</span>
                            <span className="pipe-stage-desc">{stage.shortDesc}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Selected Stage Detail Card */}
                    <div className="stage-detail-box glass-panel">
                      <div className="stage-detail-header">
                        <div className="stage-detail-title">
                          <FiTerminal className="font-cyan" />
                          <span>Stage {currentStage.step}: {currentStage.name} Details</span>
                        </div>
                        <span className="stage-latency-pill">{currentStage.latencyConstraint}</span>
                      </div>
                      <div className="stage-tensor-meta">
                        <code>{currentStage.tensorInput}</code>
                      </div>
                      <ul className="stage-bullets">
                        {currentStage.details.map((detail, idx) => (
                          <li key={idx}>
                            <FiCheck className="font-cyan check-sm" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="engine-content-grid">
                {/* Left Column: LLM Architecture Overview */}
                <div className="engine-text">
                  <div className="engine-badge font-cyan">
                    <FiCpu /> Domain-Adapted 70B Parameter Energy Reasoning Model
                  </div>
                  <h3>Autonomous LLM Co-Pilot for Multi-Modal Grid Orchestration</h3>
                  <p>
                    EcoSplit AI pairs deep forecasting with a domain-specialized 70B parameter foundation model equipped with deterministic tool calling. Energy engineers and microgrid operators interact with electrical topology in natural language with zero hallucination.
                  </p>

                  <ul className="engine-feature-list">
                    <li>
                      <FiCheck className="check-icon font-cyan" />
                      <div>
                        <strong>Deterministic Function Calling:</strong> Translates high-level energy goals into validated inverter setpoints and automated OpenADR 2.0b curtailment events via REST/Webhooks.
                      </div>
                    </li>
                    <li>
                      <FiCheck className="check-icon font-cyan" />
                      <div>
                        <strong>Conversational Attribution:</strong> Explains complex neural decisions (e.g., &quot;Why did the battery discharge at 14:00?&quot;) with mathematically grounded price and weather attribution.
                      </div>
                    </li>
                    <li>
                      <FiCheck className="check-icon font-cyan" />
                      <div>
                        <strong>Dynamic Rule Overrides:</strong> Natural language directives like &quot;Hold 30% battery reserve for storm watch&quot; compile directly into the real-time MILP solver constraints.
                      </div>
                    </li>
                    <li>
                      <FiCheck className="check-icon font-cyan" />
                      <div>
                        <strong>Certified Utility Compliance:</strong> Ingests OpenADR 2.0b signals, coordinates Virtual End Node (VEN) load shedding, and produces audit-ready compliance logs.
                      </div>
                    </li>
                  </ul>

                  <div className="engine-cta">
                    <Link href="/demo" className="btn-cta btn-primary">
                      Interact with Co-Pilot in Demo <FiArrowRight />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Interactive Conversational Attribution Simulator */}
                <div className="engine-diagram">
                  <div className="diagram-card glass-panel">
                    <div className="diagram-header">
                      <div className="diagram-title">
                        <FiSliders className="font-cyan" />
                        <span>Conversational Attribution &amp; Tool Calling</span>
                      </div>
                      <span className="live-pulse-badge">
                        <span className="live-pulse-dot"></span> Deterministic Dispatch
                      </span>
                    </div>

                    <p className="diagram-instruction">
                      Select a sample co-pilot command to preview deterministic tool execution:
                    </p>

                    {/* Scenario Pills */}
                    <div className="copilot-scenario-pills">
                      {copilotScenarios.map((sc) => (
                        <button
                          key={sc.id}
                          className={`copilot-pill ${selectedCopilotScenario === sc.id ? "active" : ""}`}
                          onClick={() => setSelectedCopilotScenario(sc.id)}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>

                    {/* Dialogue & Attribution Output */}
                    <div className="mock-chat-preview">
                      <div className="chat-bubble-preview user">
                        <div className="bubble-sender">Operator / Facility Manager</div>
                        <div className="bubble-text">&ldquo;{currentScenario.query}&rdquo;</div>
                      </div>

                      <div className="chat-tool-execution">
                        <div className="tool-call-label">
                          <FiTerminal className="font-green" /> Deterministic Tool Call Dispatched
                        </div>
                        <code>{currentScenario.functionCalled}</code>
                      </div>

                      <div className="chat-bubble-preview ai">
                        <div className="ai-tag-wrapper">
                          <span className="ai-tag">EcoSplit Co-Pilot</span>
                          <span className="ai-model-tag">70B Energy Model</span>
                        </div>
                        <p className="bubble-text">{currentScenario.response}</p>

                        <div className="attribution-breakdown">
                          <span className="attribution-title">Decision Attribution Factors:</span>
                          <div className="attribution-chips">
                            {currentScenario.attribution.map((attr, idx) => (
                              <div key={idx} className="attr-chip">
                                <span className="attr-name">{attr.factor}</span>
                                <span className="attr-val font-cyan">{attr.weight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
