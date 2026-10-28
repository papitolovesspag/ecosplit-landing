"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiZap,
  FiBatteryCharging,
  FiCpu,
  FiActivity,
  FiDollarSign,
  FiTrendingDown,
  FiSend,
  FiClock,
  FiSun,
  FiSliders,
  FiAlertTriangle,
  FiRefreshCw,
  FiServer,
  FiCloud,
} from "react-icons/fi";

// --- Types ---
type GridStatus = "ONLINE" | "PEAKER_ALERT" | "ISLANDED";

interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  timestamp: string;
  text: string;
  latencyMs?: number;
  model?: string;
  metrics?: {
    shavedKw: number;
    savingsPct: number;
    avoidedCostHourly: number;
    action: string;
  };
}

export default function DemoSimulatorPage() {
  // --- Simulation Control State ---
  const [baseLoad, setBaseLoad] = useState<number>(12.5); // 2.0 to 25.0 kW
  const [peakThreshold, setPeakThreshold] = useState<number>(7.5); // 2.0 to 20.0 kW
  const [tariffMultiplier, setTariffMultiplier] = useState<number>(0.48); // $0.12 to $0.72 / kWh
  const [batterySplit, setBatterySplit] = useState<number>(65); // 0% to 100%
  const [batterySoc, setBatterySoc] = useState<number>(82); // 10% to 100%
  const [autoArbitrage, setAutoArbitrage] = useState<boolean>(true);
  const [gridStatus, setGridStatus] = useState<GridStatus>("ONLINE");
  const [activePreset, setActivePreset] = useState<string>("arbitrage");

  // Telemetry jitter & latency pulse
  const [liveJitter, setLiveJitter] = useState<number>(0);
  const [streamLatency, setStreamLatency] = useState<number>(84);

  // Chart interactivity
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Chat State
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "init-1",
      sender: "copilot",
      timestamp: "16:41:00",
      model: "NeuralSplit-v2.4",
      latencyMs: 88,
      text: "⚡ EcoSplit Neural Co-Pilot connected to OpenADR 2.0b telemetry stream. Real-time smart split logic is monitoring facility load against TOU peak tariffs. Select an operational preset or click a diagnostic prompt below.",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Real-time jitter interval for authentic live telemetry stream feel
  useEffect(() => {
    const interval = setInterval(() => {
      // Micro-fluctuation between -0.15 and +0.15 kW
      setLiveJitter((Math.random() - 0.5) * 0.3);
      // Realistic P99 inference latency fluctuation between 82ms and 114ms
      setStreamLatency(Math.floor(82 + Math.random() * 32));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  // --- Real-Time Mathematical Engine ---
  const currentEffectiveLoad = Math.max(2.0, Math.round((baseLoad + liveJitter) * 10) / 10);
  const isIslanded = gridStatus === "ISLANDED";
  const excessDemand = Math.max(0, currentEffectiveLoad - peakThreshold);

  const {
    activeGridLoad,
    batteryDischarge,
    deferredLoad,
    baselineCostPerHour,
    optimizedCostPerHour,
    hourlySavings,
    costReductionPct,
    annualSavings,
    hourlyCo2Avoided,
    annualCo2Avoided,
    treesEquivalent,
  } = useMemo(() => {
    let batDischarge = 0;
    let defLoad = 0;
    let gridLoad = currentEffectiveLoad;

    if (isIslanded) {
      gridLoad = 0;
      // In islanded microgrid mode, battery supports critical loads up to 12kW
      batDischarge = Math.min(peakThreshold, 12.0);
      defLoad = 0; // shed deferrable loads during blackout
    } else if (autoArbitrage && excessDemand > 0) {
      batDischarge = Math.min(excessDemand * (batterySplit / 100), 12.0);
      defLoad = Math.max(0, excessDemand - batDischarge);
      gridLoad = Math.min(currentEffectiveLoad, peakThreshold);
    } else {
      gridLoad = currentEffectiveLoad;
    }

    // Economics
    const offPeakTariff = 0.12; // base off-peak kWh cost
    const roundTripEfficiency = 0.92; // LiFePO4 BESS round-trip efficiency
    const baselineCost = currentEffectiveLoad * tariffMultiplier;

    // Optimized cost: active grid draw at current tariff + battery replenishment off-peak + deferred shifted off-peak
    const gridCost = isIslanded ? 0 : gridLoad * tariffMultiplier;
    const batReplenishCost = (batDischarge / roundTripEfficiency) * offPeakTariff;
    const defCost = defLoad * offPeakTariff;
    const optimizedCost = gridCost + batReplenishCost + defCost;

    const savedHourly = Math.max(0, baselineCost - optimizedCost);
    // Real-world cost reduction % clamped to realistic physical bounds (up to 45%)
    const rawPct = baselineCost > 0 ? (savedHourly / baselineCost) * 100 : 0;
    const reductionPct = Math.min(45.0, Math.round(rawPct * 10) / 10);

    // Projected savings: 6 peak hours daily * 365 days
    const projectedAnnual = savedHourly * 6 * 365;

    // Carbon offset:
    // Peaker plant emissions: 0.68 kg CO2/kWh vs off-peak renewable baseload: 0.22 kg CO2/kWh
    const peakerFactor = 0.68;
    const cleanFactor = 0.22;
    const avoidedCo2 = isIslanded
      ? peakThreshold * peakerFactor
      : Math.max(
          0,
          (batDischarge + defLoad) * peakerFactor -
            ((batDischarge / roundTripEfficiency) + defLoad) * cleanFactor
        );
    const annualCo2 = avoidedCo2 * 6 * 365;
    const trees = Math.round(annualCo2 / 21.8);

    return {
      activeGridLoad: Math.round(gridLoad * 10) / 10,
      batteryDischarge: Math.round(batDischarge * 10) / 10,
      deferredLoad: Math.round(defLoad * 10) / 10,
      baselineCostPerHour: Math.round(baselineCost * 100) / 100,
      optimizedCostPerHour: Math.round(optimizedCost * 100) / 100,
      hourlySavings: Math.round(savedHourly * 100) / 100,
      costReductionPct: reductionPct,
      annualSavings: Math.round(projectedAnnual),
      hourlyCo2Avoided: Math.round(avoidedCo2 * 100) / 100,
      annualCo2Avoided: Math.round(annualCo2),
      treesEquivalent: trees,
    };
  }, [currentEffectiveLoad, peakThreshold, tariffMultiplier, batterySplit, autoArbitrage, isIslanded, excessDemand]);

  // --- Operational Presets ---
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    let note = "";
    if (presetKey === "arbitrage") {
      setBaseLoad(14.5);
      setPeakThreshold(6.5);
      setTariffMultiplier(0.58);
      setBatterySplit(80);
      setGridStatus("ONLINE");
      setAutoArbitrage(true);
      note = "Engaged Peak Tariff Arbitrage: Clamped grid imports to 6.5 kW. Maximum BESS storage discharge during peak tariff spike ($0.58/kWh).";
    } else if (presetKey === "green") {
      setBaseLoad(10.0);
      setPeakThreshold(4.5);
      setTariffMultiplier(0.32);
      setBatterySplit(45);
      setGridStatus("ONLINE");
      setAutoArbitrage(true);
      note = "Engaged Green Grid / Low Carbon: Shifted 55% of excess load into overnight wind/solar generation window. Minimizing peaker-plant emissions.";
    } else if (presetKey === "critical") {
      setBaseLoad(18.0);
      setPeakThreshold(4.0);
      setTariffMultiplier(0.72);
      setBatterySplit(95);
      setGridStatus("PEAKER_ALERT");
      setAutoArbitrage(true);
      note = "Engaged Critical Grid Stress / Peaker Event: Severe grid frequency depression. Maximum demand response shaving with 95% battery dispatch.";
    } else if (presetKey === "ev_fleet") {
      setBaseLoad(24.0);
      setPeakThreshold(10.0);
      setTariffMultiplier(0.48);
      setBatterySplit(65);
      setGridStatus("ONLINE");
      setAutoArbitrage(true);
      note = "Engaged EV Fleet & Heavy Load Spike: Multi-vehicle charging spike detected (24.0 kW). Dynamic load-split throttling and staggered charging active.";
    }

    // Add Copilot notification
    if (note) {
      setMessages((prev) => [
        ...prev,
        {
          id: `preset-${Date.now()}`,
          sender: "copilot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          model: "NeuralSplit-v2.4",
          latencyMs: Math.floor(84 + Math.random() * 26),
          text: `⚙️ Preset Applied: [${presetKey.toUpperCase()}]\n${note}`,
          metrics: {
            shavedKw: Math.max(0, baseLoad - peakThreshold),
            savingsPct: costReductionPct,
            avoidedCostHourly: hourlySavings,
            action: `PRESET_${presetKey.toUpperCase()}`,
          },
        },
      ]);
    }
  };

  // --- 24-Hour Diurnal Dispatch Waveform Data ---
  const hourlyWaveformData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, hour) => {
      // Natural diurnal commercial/residential curve with peak around 17:30
      const morningBump = 0.35 * Math.exp(-Math.pow((hour - 8) / 2.2, 2));
      const eveningPeak = 0.65 * Math.exp(-Math.pow((hour - 17.5) / 3.2, 2));
      const diurnalFactor = 0.35 + morningBump + eveningPeak;
      const hourBaseline = Math.round(baseLoad * diurnalFactor * 10) / 10;

      const isPeakHour = hour >= 14 && hour <= 20;
      let gridDrawn = hourBaseline;
      let batAssist = 0;
      let defLoad = 0;

      if (autoArbitrage && isPeakHour && hourBaseline > peakThreshold) {
        const excess = hourBaseline - peakThreshold;
        batAssist = Math.round(Math.min(excess * (batterySplit / 100), 12.0) * 10) / 10;
        defLoad = Math.round(Math.max(0, excess - batAssist) * 10) / 10;
        gridDrawn = peakThreshold;
      } else if (hour >= 1 && hour <= 5) {
        // Off-peak replenishment window
        gridDrawn = Math.round((hourBaseline + 1.2) * 10) / 10;
      }

      return {
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
        baseline: hourBaseline,
        gridDrawn,
        batAssist,
        defLoad,
        isPeakHour,
      };
    });
  }, [baseLoad, peakThreshold, batterySplit, autoArbitrage]);

  // --- AI Co-Pilot Execution ---
  const executeAiCommand = (commandType: string, customText?: string) => {
    setIsAiThinking(true);
    const userPrompt = customText || commandType;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        text: userPrompt,
      },
    ]);

    // Simulate AI inference latency (~84ms to 118ms)
    const inferenceLatency = Math.floor(84 + Math.random() * 34);

    setTimeout(() => {
      let reply = "";
      let newShaved = 0;
      let actionTag = "ARBITRAGE_EVAL";

      const lower = userPrompt.toLowerCase();

      if (commandType === "optimize" || lower.includes("optimize") || lower.includes("peak tariff")) {
        setTariffMultiplier(0.58);
        setPeakThreshold(5.5);
        setBatterySplit(85);
        setAutoArbitrage(true);
        setGridStatus("ONLINE");
        newShaved = Math.max(0, baseLoad - 5.5);
        actionTag = "OPTIMIZE_PEAK_TARIFF";
        reply = `✅ Optimization Complete (Inference Latency: ${inferenceLatency}ms)\n\n• Telemetry: Detected active On-Peak tier ($0.58/kWh).\n• Action: Clamped grid threshold to 5.5 kW; escalated BESS dispatch to 85%.\n• Result: Shaving ${newShaved.toFixed(1)} kW from grid draw. Projected cost reduction: 42.8% ($${(newShaved * 0.46).toFixed(2)}/hr net savings).`;
      } else if (commandType === "diagnose" || lower.includes("diagnose") || lower.includes("anomaly")) {
        actionTag = "DIAGNOSE_ANOMALY";
        reply = `🔍 Diagnostics Telemetry Report (Inference Latency: ${inferenceLatency}ms)\n\n• Root-Cause Analysis: Phase B sub-meter indicates 3.8 kW continuous inductive draw on Chiller Circuit #2.\n• Anomaly Score: 0.94 (Duty cycle elevated 41% above historical 68°F baseline).\n• Autonomous Mitigation: Dispatched OpenADR 2.0b duty-cycle clamp. Sub-meter draw stabilized without compromising thermal comfort.`;
      } else if (commandType === "outage" || lower.includes("outage") || lower.includes("blackout") || lower.includes("island")) {
        setGridStatus("ISLANDED");
        setBatterySplit(100);
        setBatterySoc((prev) => Math.max(25, prev - 8));
        actionTag = "GRID_ISLANDING";
        const runwayHours = Math.round(((batterySoc / 100) * 20) / Math.max(1, peakThreshold) * 10) / 10;
        reply = `⚠️ GRID LOSS DETECTED: Microgrid Islanding Engaged (Latency: ${inferenceLatency}ms)\n\n• Status: Utility intertie isolated via high-speed ATS (<12ms switchover).\n• Islanding Power: Battery BESS supplying ${peakThreshold.toFixed(1)} kW critical loads.\n• Storage Runway: ${runwayHours} hours autonomy remaining at ${batterySoc}% SoC.\n• Load Shedding: EV chargers and deferrable thermal loops isolated.`;
      } else if (commandType === "forecast" || lower.includes("forecast") || lower.includes("tomorrow")) {
        actionTag = "FORECAST_PEAK";
        setBatterySoc(95);
        reply = `📈 24-Hour Predictive Neural Forecast (Inference Latency: ${inferenceLatency}ms)\n\n• Ingestion: NOAA Weather API indicates heatwave peaking at 98°F tomorrow (15:00 - 19:00).\n• Tariff Warning: Wholesale Day-Ahead LMP projected at $0.72/kWh Critical Peaker Tier.\n• Autonomous Strategy: Pre-charge BESS to 95% tonight at 03:00 AM off-peak ($0.12/kWh). Avoided cost forecast: $138.40 avoided demand surcharges tomorrow.`;
      } else if (lower.includes("threshold") && /\d+/.test(lower)) {
        const match = lower.match(/\d+(\.\d+)?/);
        if (match) {
          const val = Math.min(20, Math.max(2, parseFloat(match[0])));
          setPeakThreshold(val);
          actionTag = "SET_THRESHOLD";
          reply = `⚙️ Parameter Updated: Peak Shaving Threshold adjusted to ${val.toFixed(1)} kW. Recalculating split allocation in real time.`;
        }
      } else if (lower.includes("load") && /\d+/.test(lower)) {
        const match = lower.match(/\d+(\.\d+)?/);
        if (match) {
          const val = Math.min(25, Math.max(2, parseFloat(match[0])));
          setBaseLoad(val);
          actionTag = "SET_BASE_LOAD";
          reply = `⚙️ Parameter Updated: Base Facility Load adjusted to ${val.toFixed(1)} kW. Dynamic telemetry updated.`;
        }
      } else if (lower.includes("battery") && /\d+/.test(lower)) {
        const match = lower.match(/\d+/);
        if (match) {
          const val = Math.min(100, Math.max(0, parseInt(match[0])));
          setBatterySplit(val);
          actionTag = "SET_BATTERY_SPLIT";
          reply = `⚙️ Parameter Updated: Battery BESS split ratio set to ${val}%. Excess load will split ${val}% BESS / ${100 - val}% deferred.`;
        }
      } else if (lower.includes("reset") || lower.includes("online")) {
        setGridStatus("ONLINE");
        setBaseLoad(12.5);
        setPeakThreshold(7.5);
        setTariffMultiplier(0.48);
        setBatterySplit(65);
        setBatterySoc(85);
        setAutoArbitrage(true);
        actionTag = "RESET_SIMULATION";
        reply = `🔄 Simulation parameters restored to standard baseline telemetry. Grid connected and monitoring.`;
      } else {
        actionTag = "COGNITIVE_QUERY";
        reply = `💡 Energy Intelligence Query: EcoSplit Neural Engine is dynamically balancing ${currentEffectiveLoad.toFixed(1)} kW load with ${costReductionPct.toFixed(1)}% avoided cost ($${hourlySavings.toFixed(2)}/hr). Active grid draw clamped to ${activeGridLoad.toFixed(1)} kW. You can ask me to adjust thresholds, simulate outages, or optimize tariffs!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          model: "NeuralSplit-v2.4",
          latencyMs: inferenceLatency,
          text: reply,
          metrics: {
            shavedKw: excessDemand,
            savingsPct: costReductionPct,
            avoidedCostHourly: hourlySavings,
            action: actionTag,
          },
        },
      ]);
      setIsAiThinking(false);
    }, inferenceLatency);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isAiThinking) return;
    const txt = inputPrompt;
    setInputPrompt("");
    executeAiCommand("custom", txt);
  };

  // --- SVG Radial Gauge Constants ---
  const gaugeRadius = 68;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius; // ~427.25
  // Gauge spans 0% to 50% max reduction
  const gaugePercentClamped = Math.min(50, Math.max(0, costReductionPct));
  const gaugeOffset = gaugeCircumference * (1 - gaugePercentClamped / 50);

  return (
    <main className="demo-page-root">
      {/* Scoped CSS to ensure 100% theme fidelity and zero global style pollution */}
      <style>{`
        .demo-page-root {
          min-height: 100vh;
          padding-top: 80px;
          padding-bottom: 3rem;
          color: var(--foreground);
          background: transparent;
          font-family: var(--font-sans);
        }

        .demo-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }

        /* Top Console Navigation Bar */
        .demo-topbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.25rem;
          border-radius: 12px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(16px);
        }

        .demo-brand-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .demo-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--foreground);
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          transition: all 0.2s ease;
        }

        .demo-back-btn:hover {
          color: var(--primary);
          border-color: var(--primary);
          transform: translateX(-2px);
        }

        .demo-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .demo-title-wrap h1 {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .badge-live-mvp {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.15);
          color: var(--primary);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .demo-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-family: var(--font-mono);
          padding: 0.4rem 0.85rem;
          border-radius: 20px;
          background: rgba(6, 182, 212, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(6, 182, 212, 0.25);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary);
          animation: pulseGlow 1.8s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        /* Operational Preset Selector */
        .preset-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .preset-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          color: var(--foreground);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(12px);
        }

        .preset-btn:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 16px var(--glow-color);
          transform: translateY(-2px);
        }

        .preset-btn.active {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.1);
          box-shadow: 0 0 14px var(--glow-color);
        }

        .preset-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--primary);
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .preset-btn.active .preset-icon-wrap {
          background: var(--primary);
          color: #030712;
        }

        .preset-info {
          display: flex;
          flex-direction: column;
        }

        .preset-name {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .preset-sub {
          font-size: 0.72rem;
          opacity: 0.7;
          line-height: 1.2;
          margin-top: 2px;
        }

        /* KPI Banner */
        .kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .kpi-card {
          padding: 1rem 1.2rem;
          border-radius: 12px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          opacity: 0.75;
        }

        .kpi-val {
          font-size: 1.55rem;
          font-weight: 800;
          font-family: var(--font-mono);
          letter-spacing: -0.02em;
        }

        .kpi-meta {
          font-size: 0.74rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          opacity: 0.8;
        }

        .kpi-badge-positive {
          color: var(--primary);
          font-weight: 700;
        }

        /* 2-Column Workstation Layout */
        .demo-grid-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.25rem;
          align-items: start;
        }

        @media (max-width: 1040px) {
          .demo-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .glass-box {
          padding: 1.25rem;
          border-radius: 14px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(16px);
          margin-bottom: 1.25rem;
        }

        .box-title {
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 0.65rem;
        }

        .box-title-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Controls Section */
        .controls-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1.25rem;
        }

        @media (max-width: 640px) {
          .controls-grid {
            grid-template-columns: 1fr;
          }
        }

        .ctrl-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .ctrl-label-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .ctrl-val {
          font-family: var(--font-mono);
          color: var(--primary);
          font-weight: 700;
        }

        .slider-input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.12);
          outline: none;
          cursor: pointer;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 0 8px var(--primary);
          transition: transform 0.1s ease;
        }

        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        /* Gauge & Savings Display */
        .savings-split-container {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 1.25rem;
          align-items: center;
        }

        @media (max-width: 580px) {
          .savings-split-container {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        .gauge-svg-wrap {
          position: relative;
          width: 170px;
          height: 170px;
          margin: 0 auto;
        }

        .gauge-center-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }

        .gauge-big-num {
          font-size: 1.6rem;
          font-weight: 800;
          font-family: var(--font-mono);
          color: var(--primary);
          line-height: 1;
        }

        .gauge-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
          opacity: 0.7;
          margin-top: 3px;
          letter-spacing: 0.05em;
        }

        .savings-data-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .savings-data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          font-size: 0.85rem;
        }

        .savings-data-item .val {
          font-family: var(--font-mono);
          font-weight: 700;
        }

        /* Waveform Chart */
        .waveform-container {
          width: 100%;
          overflow-x: auto;
        }

        .waveform-chart-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }

        /* Power Flow Topology */
        .topology-svg-wrap {
          width: 100%;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--card-border);
          padding: 0.5rem;
        }

        /* AI Co-Pilot Panel */
        .copilot-panel {
          display: flex;
          flex-direction: column;
          height: 720px;
          border-radius: 14px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(16px);
          overflow: hidden;
        }

        .copilot-header {
          padding: 0.9rem 1.15rem;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
        }

        .copilot-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .copilot-meta-pill {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.12);
          color: var(--primary);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        /* Quick Prompt Pills */
        .prompt-pills-wrap {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--card-border);
          background: rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .pills-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          opacity: 0.6;
          letter-spacing: 0.05em;
        }

        .pills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.45rem;
        }

        .pill-action-btn {
          font-size: 0.75rem;
          text-align: left;
          padding: 0.45rem 0.65rem;
          border-radius: 6px;
          border: 1px solid var(--card-border);
          background: rgba(255, 255, 255, 0.04);
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pill-action-btn:hover {
          border-color: var(--secondary);
          background: rgba(6, 182, 212, 0.12);
          color: var(--secondary);
        }

        /* Chat Stream */
        .copilot-stream {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .chat-bubble {
          max-width: 90%;
          padding: 0.75rem 0.95rem;
          border-radius: 10px;
          font-size: 0.82rem;
          line-height: 1.45;
          word-break: break-word;
        }

        .chat-bubble.user {
          align-self: flex-end;
          background: var(--primary);
          color: #030712;
          font-weight: 600;
          border-bottom-right-radius: 2px;
        }

        .chat-bubble.copilot {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          border-bottom-left-radius: 2px;
        }

        .bubble-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          opacity: 0.7;
          margin-bottom: 0.35rem;
        }

        .bubble-metrics-tag {
          margin-top: 0.5rem;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.72rem;
          font-family: var(--font-mono);
          display: flex;
          flex-direction: column;
          gap: 2px;
          color: var(--secondary);
        }

        .thinking-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-style: italic;
          opacity: 0.7;
          font-size: 0.75rem;
        }

        /* Chat Input Form */
        .copilot-input-form {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--card-border);
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          gap: 0.5rem;
        }

        .copilot-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--card-border);
          color: var(--foreground);
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .copilot-input:focus {
          border-color: var(--primary);
        }

        .copilot-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: var(--primary);
          color: #030712;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: opacity 0.2s ease;
        }

        .copilot-submit-btn:hover {
          opacity: 0.9;
        }

        .copilot-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      <div className="demo-container">
        {/* --- Top Console Header --- */}
        <div className="demo-topbar">
          <div className="demo-brand-group">
            <Link href="/" className="demo-back-btn">
              <FiArrowLeft /> Return to Landing
            </Link>
            <div className="demo-title-wrap">
              <h1>EcoSplit AI</h1>
              <span className="badge-live-mvp">Live Simulation Console</span>
            </div>
          </div>
          <div className="demo-brand-group">
            <div className="demo-status-pill">
              <span className="live-dot" />
              <span>Telemetry Active | {streamLatency}ms Latency</span>
            </div>
            <div
              className="demo-status-pill"
              style={{
                borderColor:
                  gridStatus === "PEAKER_ALERT"
                    ? "rgba(239, 68, 68, 0.5)"
                    : gridStatus === "ISLANDED"
                    ? "rgba(245, 158, 11, 0.5)"
                    : "rgba(16, 185, 129, 0.3)",
                color:
                  gridStatus === "PEAKER_ALERT"
                    ? "#ef4444"
                    : gridStatus === "ISLANDED"
                    ? "#f59e0b"
                    : "var(--primary)",
              }}
            >
              <FiActivity />
              <span>Grid: {gridStatus}</span>
            </div>
          </div>
        </div>

        {/* --- 4 Operational Preset Scenarios --- */}
        <div className="preset-strip">
          <button
            className={`preset-btn ${activePreset === "arbitrage" ? "active" : ""}`}
            onClick={() => applyPreset("arbitrage")}
          >
            <div className="preset-icon-wrap">
              <FiDollarSign />
            </div>
            <div className="preset-info">
              <span className="preset-name">Peak Tariff Arbitrage</span>
              <span className="preset-sub">Clamps grid, 80% BESS discharge during spike</span>
            </div>
          </button>

          <button
            className={`preset-btn ${activePreset === "green" ? "active" : ""}`}
            onClick={() => applyPreset("green")}
          >
            <div className="preset-icon-wrap">
              <FiSun />
            </div>
            <div className="preset-info">
              <span className="preset-name">Green Grid / Low Carbon</span>
              <span className="preset-sub">Shifts 55% deferrable load to clean renewables</span>
            </div>
          </button>

          <button
            className={`preset-btn ${activePreset === "critical" ? "active" : ""}`}
            onClick={() => applyPreset("critical")}
          >
            <div className="preset-icon-wrap">
              <FiAlertTriangle />
            </div>
            <div className="preset-info">
              <span className="preset-name">Critical Grid Stress</span>
              <span className="preset-sub">Peaker emergency; 95% battery demand response</span>
            </div>
          </button>

          <button
            className={`preset-btn ${activePreset === "ev_fleet" ? "active" : ""}`}
            onClick={() => applyPreset("ev_fleet")}
          >
            <div className="preset-icon-wrap">
              <FiZap />
            </div>
            <div className="preset-info">
              <span className="preset-name">EV Fleet & Heavy Spike</span>
              <span className="preset-sub">24 kW multi-vehicle spike; dynamic throttling</span>
            </div>
          </button>
        </div>

        {/* --- Live Telemetry KPI Cards --- */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Active Grid Import</span>
              <FiServer style={{ color: "var(--secondary)" }} />
            </div>
            <div className="kpi-val" style={{ color: "var(--secondary)" }}>
              {activeGridLoad.toFixed(1)} <span style={{ fontSize: "0.9rem" }}>kW</span>
            </div>
            <div className="kpi-meta">
              <span>Unshaved: {currentEffectiveLoad.toFixed(1)} kW</span>
              <span className="kpi-badge-positive">
                (-{Math.max(0, currentEffectiveLoad - activeGridLoad).toFixed(1)} kW)
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>BESS Dispatch & SoC</span>
              <FiBatteryCharging style={{ color: "var(--primary)" }} />
            </div>
            <div className="kpi-val" style={{ color: "var(--primary)" }}>
              {batteryDischarge.toFixed(1)} <span style={{ fontSize: "0.9rem" }}>kW</span>
            </div>
            <div className="kpi-meta">
              <span>State of Charge:</span>
              <span className="kpi-badge-positive">{batterySoc}% (Healthy)</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Avoided Cost Rate</span>
              <FiTrendingDown style={{ color: "var(--primary)" }} />
            </div>
            <div className="kpi-val" style={{ color: "var(--primary)" }}>
              ${hourlySavings.toFixed(2)} <span style={{ fontSize: "0.9rem" }}>/hr</span>
            </div>
            <div className="kpi-meta">
              <span>Projected:</span>
              <span className="kpi-badge-positive">${annualSavings.toLocaleString()} / yr</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>CO2 Abatement</span>
              <FiCloud style={{ color: "var(--secondary)" }} />
            </div>
            <div className="kpi-val" style={{ color: "var(--secondary)" }}>
              {hourlyCo2Avoided.toFixed(2)} <span style={{ fontSize: "0.9rem" }}>kg/hr</span>
            </div>
            <div className="kpi-meta">
              <span>Annual:</span>
              <span className="kpi-badge-positive">~{annualCo2Avoided.toLocaleString()} kg (~{treesEquivalent} trees eq.)</span>
            </div>
          </div>
        </div>

        {/* --- Main 2-Column Workstation Grid --- */}
        <div className="demo-grid-layout">
          {/* Left Column: Visualizers & Controls */}
          <div>
            {/* 1. Interactive Load-Balancing Sliders */}
            <div className="glass-box">
              <div className="box-title">
                <div className="box-title-left">
                  <FiSliders style={{ color: "var(--primary)" }} />
                  <span>Real-Time Dynamic Load Controls</span>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={autoArbitrage}
                    onChange={(e) => setAutoArbitrage(e.target.checked)}
                  />
                  <span>Autonomous Arbitrage Engine</span>
                </label>
              </div>

              <div className="controls-grid">
                {/* Base Energy Load */}
                <div className="ctrl-group">
                  <div className="ctrl-label-wrap">
                    <span>Base Facility Load</span>
                    <span className="ctrl-val">{baseLoad.toFixed(1)} kW</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="25.0"
                    step="0.5"
                    value={baseLoad}
                    onChange={(e) => setBaseLoad(parseFloat(e.target.value))}
                    className="slider-input"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", opacity: 0.5 }}>
                    <span>2.0 kW (Light)</span>
                    <span>25.0 kW (Heavy Industrial)</span>
                  </div>
                </div>

                {/* Peak Shaving Threshold */}
                <div className="ctrl-group">
                  <div className="ctrl-label-wrap">
                    <span>Peak Shaving Threshold</span>
                    <span className="ctrl-val">{peakThreshold.toFixed(1)} kW</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="20.0"
                    step="0.5"
                    value={peakThreshold}
                    onChange={(e) => setPeakThreshold(parseFloat(e.target.value))}
                    className="slider-input"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", opacity: 0.5 }}>
                    <span>2.0 kW (Aggressive)</span>
                    <span>20.0 kW (Permissive)</span>
                  </div>
                </div>

                {/* Grid Tariff Multiplier */}
                <div className="ctrl-group">
                  <div className="ctrl-label-wrap">
                    <span>Grid Tariff Rate</span>
                    <span className="ctrl-val">${tariffMultiplier.toFixed(2)} / kWh</span>
                  </div>
                  <input
                    type="range"
                    min="0.12"
                    max="0.72"
                    step="0.02"
                    value={tariffMultiplier}
                    onChange={(e) => setTariffMultiplier(parseFloat(e.target.value))}
                    className="slider-input"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", opacity: 0.5 }}>
                    <span>$0.12 (Off-Peak)</span>
                    <span>$0.72 (Critical Peaker)</span>
                  </div>
                </div>

                {/* Battery Storage Split Ratio */}
                <div className="ctrl-group">
                  <div className="ctrl-label-wrap">
                    <span>BESS Storage Split</span>
                    <span className="ctrl-val">{batterySplit}% ({100 - batterySplit}% Defer)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={batterySplit}
                    onChange={(e) => setBatterySplit(parseInt(e.target.value))}
                    className="slider-input"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", opacity: 0.5 }}>
                    <span>0% (All Deferred)</span>
                    <span>100% (All Battery Assist)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Radial Gauge & Economics */}
            <div className="glass-box">
              <div className="box-title">
                <div className="box-title-left">
                  <FiDollarSign style={{ color: "var(--primary)" }} />
                  <span>Real-Time Arbitrage & Cost Reduction</span>
                </div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.7 }}>
                  Efficiency η = 92%
                </span>
              </div>

              <div className="savings-split-container">
                {/* SVG Radial Gauge */}
                <div className="gauge-svg-wrap">
                  <svg width="170" height="170" viewBox="0 0 170 170">
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <filter id="gaugeGlow">
                        <feGaussianBlur stdDeviation="3" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Background Ring */}
                    <circle
                      cx="85"
                      cy="85"
                      r={gaugeRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="12"
                    />
                    {/* Progress Glowing Ring */}
                    <circle
                      cx="85"
                      cy="85"
                      r={gaugeRadius}
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="12"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeOffset}
                      strokeLinecap="round"
                      filter="url(#gaugeGlow)"
                      transform="rotate(-90 85 85)"
                      style={{ transition: "stroke-dashoffset 0.4s ease" }}
                    />
                  </svg>
                  <div className="gauge-center-text">
                    <div className="gauge-big-num">{costReductionPct.toFixed(1)}%</div>
                    <div className="gauge-label">Cost Slashed</div>
                  </div>
                </div>

                {/* Economics Breakdown */}
                <div className="savings-data-list">
                  <div className="savings-data-item">
                    <span>Unmanaged Baseline Cost</span>
                    <span className="val" style={{ color: "#ef4444" }}>
                      ${baselineCostPerHour.toFixed(2)} / hr
                    </span>
                  </div>
                  <div className="savings-data-item">
                    <span>EcoSplit Arbitrage Net Cost</span>
                    <span className="val" style={{ color: "var(--primary)" }}>
                      ${optimizedCostPerHour.toFixed(2)} / hr
                    </span>
                  </div>
                  <div className="savings-data-item">
                    <span>Hourly Arbitrage Margin</span>
                    <span className="val" style={{ color: "var(--primary)" }}>
                      +${hourlySavings.toFixed(2)} / hr avoided
                    </span>
                  </div>
                  <div className="savings-data-item">
                    <span>Projected 12-Mo Financial ROI</span>
                    <span className="val" style={{ color: "var(--secondary)" }}>
                      ${annualSavings.toLocaleString()} / year
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Interactive 24-Hour Dispatch Waveform (SVG) */}
            <div className="glass-box">
              <div className="box-title">
                <div className="box-title-left">
                  <FiClock style={{ color: "var(--secondary)" }} />
                  <span>24-Hour Diurnal Dispatch Waveform (Interactive Scrubbing)</span>
                </div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.7 }}>
                  {hoveredHour !== null
                    ? `Hour ${hourlyWaveformData[hoveredHour].label}: Base ${hourlyWaveformData[hoveredHour].baseline} kW | Shaved ${hourlyWaveformData[hoveredHour].gridDrawn} kW`
                    : "Hover over hours to inspect telemetry"}
                </span>
              </div>

              <div className="waveform-container">
                <svg
                  viewBox="0 0 760 220"
                  className="waveform-chart-svg"
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  <defs>
                    <linearGradient id="gridAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="batAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
                    </linearGradient>
                    <linearGradient id="deferAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>

                  {/* Chart Grid Lines */}
                  {[0, 5, 10, 15, 20, 25].map((val) => {
                    const y = 180 - (val / 25) * 150;
                    return (
                      <g key={val}>
                        <line
                          x1="40"
                          y1={y}
                          x2="740"
                          y2={y}
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeDasharray="3 3"
                        />
                        <text
                          x="32"
                          y={y + 3}
                          fill="currentColor"
                          opacity="0.4"
                          fontSize="9"
                          fontFamily="var(--font-mono)"
                          textAnchor="end"
                        >
                          {val}kW
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded On-Peak Tariff Window (Hours 14 to 20) */}
                  <rect
                    x={40 + (14 / 23) * 700}
                    y="30"
                    width={(6 / 23) * 700}
                    height="150"
                    fill="rgba(239, 68, 68, 0.08)"
                    stroke="rgba(239, 68, 68, 0.25)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={40 + (17 / 23) * 700}
                    y="25"
                    fill="#ef4444"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                    fontWeight="700"
                  >
                    ON-PEAK TARIFF WINDOW ($0.48 - $0.72)
                  </text>

                  {/* Threshold Line */}
                  {(() => {
                    const threshY = 180 - (peakThreshold / 25) * 150;
                    return (
                      <g>
                        <line
                          x1="40"
                          y1={threshY}
                          x2="740"
                          y2={threshY}
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <text
                          x="735"
                          y={threshY - 5}
                          fill="#10b981"
                          fontSize="9"
                          fontFamily="var(--font-mono)"
                          textAnchor="end"
                          fontWeight="700"
                        >
                          Threshold: {peakThreshold.toFixed(1)} kW
                        </text>
                      </g>
                    );
                  })()}

                  {/* Area: Active Grid Load */}
                  {(() => {
                    const points = hourlyWaveformData.map((pt, i) => {
                      const x = 40 + (i / 23) * 700;
                      const y = 180 - (pt.gridDrawn / 25) * 150;
                      return `${x},${y}`;
                    });
                    const areaD = `M 40,180 L ${points.join(" L ")} L 740,180 Z`;
                    return <path d={areaD} fill="url(#gridAreaGrad)" />;
                  })()}

                  {/* Area: Battery Assist during Peak */}
                  {(() => {
                    const peakPts = hourlyWaveformData
                      .map((pt, i) => {
                        const x = 40 + (i / 23) * 700;
                        const baseGridY = 180 - (pt.gridDrawn / 25) * 150;
                        const topBatY = 180 - ((pt.gridDrawn + pt.batAssist) / 25) * 150;
                        return { x, baseGridY, topBatY, pt };
                      })
                      .filter((p) => p.pt.batAssist > 0);

                    if (peakPts.length > 1) {
                      const topPath = peakPts.map((p) => `${p.x},${p.topBatY}`).join(" L ");
                      const bottomPath = peakPts
                        .slice()
                        .reverse()
                        .map((p) => `${p.x},${p.baseGridY}`)
                        .join(" L ");
                      return <path d={`M ${topPath} L ${bottomPath} Z`} fill="url(#batAreaGrad)" />;
                    }
                    return null;
                  })()}

                  {/* Curve: Unmanaged Baseline Curve */}
                  {(() => {
                    const linePoints = hourlyWaveformData.map((pt, i) => {
                      const x = 40 + (i / 23) * 700;
                      const y = 180 - (pt.baseline / 25) * 150;
                      return `${x},${y}`;
                    });
                    return (
                      <path
                        d={`M ${linePoints.join(" L ")}`}
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    );
                  })()}

                  {/* Curve: Clamped Active Grid Curve */}
                  {(() => {
                    const linePoints = hourlyWaveformData.map((pt, i) => {
                      const x = 40 + (i / 23) * 700;
                      const y = 180 - (pt.gridDrawn / 25) * 150;
                      return `${x},${y}`;
                    });
                    return (
                      <path
                        d={`M ${linePoints.join(" L ")}`}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />
                    );
                  })()}

                  {/* Hour labels and hover scrubber triggers */}
                  {hourlyWaveformData.map((pt, i) => {
                    const x = 40 + (i / 23) * 700;
                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredHour(i)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Hover sensor rect */}
                        <rect
                          x={x - 14}
                          y="20"
                          width="28"
                          height="170"
                          fill="transparent"
                        />
                        {i % 3 === 0 && (
                          <text
                            x={x}
                            y="198"
                            fill="currentColor"
                            opacity="0.6"
                            fontSize="9"
                            fontFamily="var(--font-mono)"
                            textAnchor="middle"
                          >
                            {pt.label}
                          </text>
                        )}
                        {hoveredHour === i && (
                          <g>
                            <line
                              x1={x}
                              y1="30"
                              x2={x}
                              y2="180"
                              stroke="var(--foreground)"
                              strokeWidth="1"
                              opacity="0.8"
                            />
                            <circle
                              cx={x}
                              cy={180 - (pt.baseline / 25) * 150}
                              r="4"
                              fill="#f87171"
                            />
                            <circle
                              cx={x}
                              cy={180 - (pt.gridDrawn / 25) * 150}
                              r="4"
                              fill="#06b6d4"
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: "#f87171" }} />
                  <span>Baseline Unmanaged Demand</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: "#06b6d4" }} />
                  <span>Active Grid Clamped Draw</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: "#10b981" }} />
                  <span>BESS Battery Discharge</span>
                </div>
                <div className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ background: "#10b981", border: "1px dashed #10b981" }}
                  />
                  <span>Peak Shave Threshold</span>
                </div>
              </div>
            </div>

            {/* 4. Power Flow Topology */}
            <div className="glass-box">
              <div className="box-title">
                <div className="box-title-left">
                  <FiActivity style={{ color: "var(--primary)" }} />
                  <span>Real-Time Power Flow Topology (Animated Circuit Stream)</span>
                </div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.7 }}>
                  OpenADR 2.0b VEN
                </span>
              </div>

              <div className="topology-svg-wrap">
                <svg viewBox="0 0 700 210" style={{ width: "100%", height: "auto" }}>
                  <defs>
                    <linearGradient id="wireGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Topology Connecting Wires */}
                  {/* Grid to Splitter */}
                  <line
                    x1="120"
                    y1="60"
                    x2="310"
                    y2="105"
                    stroke={isIslanded ? "#ef4444" : "var(--secondary)"}
                    strokeWidth="2.5"
                    strokeDasharray={isIslanded ? "4 4" : "none"}
                  />
                  {/* Splitter to Critical Loads */}
                  <line
                    x1="390"
                    y1="105"
                    x2="560"
                    y2="60"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                  />
                  {/* Splitter to Deferred Loads */}
                  <line
                    x1="390"
                    y1="105"
                    x2="560"
                    y2="155"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  {/* Battery to Splitter */}
                  <line
                    x1="350"
                    y1="165"
                    x2="350"
                    y2="125"
                    stroke="var(--primary)"
                    strokeWidth="3"
                  />

                  {/* Moving pulse dot along Grid wire if online */}
                  {!isIslanded && activeGridLoad > 0 && (
                    <circle r="4" fill="#06b6d4">
                      <animateMotion
                        path="M 120,60 L 310,105"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Moving pulse dot along Battery wire if discharging */}
                  {batteryDischarge > 0 && (
                    <circle r="4" fill="#10b981">
                      <animateMotion
                        path="M 350,165 L 350,125"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Node 1: Utility Grid */}
                  <g transform="translate(40, 25)">
                    <rect
                      width="130"
                      height="65"
                      rx="8"
                      fill="var(--card-bg)"
                      stroke={isIslanded ? "#ef4444" : "var(--card-border)"}
                      strokeWidth="1.5"
                    />
                    <text x="65" y="24" fill="currentColor" fontSize="11" fontWeight="700" textAnchor="middle">
                      Utility Grid
                    </text>
                    <text
                      x="65"
                      y="42"
                      fill={isIslanded ? "#ef4444" : "var(--secondary)"}
                      fontSize="12"
                      fontFamily="var(--font-mono)"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {isIslanded ? "ISOLATED (0.0 kW)" : `${activeGridLoad.toFixed(1)} kW`}
                    </text>
                    <text x="65" y="56" fill="currentColor" opacity="0.6" fontSize="9" textAnchor="middle">
                      {isIslanded ? "Microgrid Active" : `$${tariffMultiplier.toFixed(2)} / kWh`}
                    </text>
                  </g>

                  {/* Node 2: EcoSplit Neural Gateway (Center) */}
                  <g transform="translate(295, 75)">
                    <rect
                      width="110"
                      height="60"
                      rx="10"
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="var(--primary)"
                      strokeWidth="2"
                    />
                    <text x="55" y="22" fill="var(--primary)" fontSize="11" fontWeight="800" textAnchor="middle">
                      NeuralSplit Hub
                    </text>
                    <text x="55" y="38" fill="currentColor" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                      v2.4 Dispatch
                    </text>
                    <text x="55" y="50" fill="var(--secondary)" fontSize="9" fontWeight="600" textAnchor="middle">
                      Δ {excessDemand.toFixed(1)} kW Shaved
                    </text>
                  </g>

                  {/* Node 3: BESS Battery Storage (Bottom Center) */}
                  <g transform="translate(285, 150)">
                    <rect
                      width="130"
                      height="50"
                      rx="8"
                      fill="var(--card-bg)"
                      stroke="var(--card-border)"
                      strokeWidth="1.5"
                    />
                    <text x="65" y="18" fill="currentColor" fontSize="10" fontWeight="700" textAnchor="middle">
                      BESS Battery Storage
                    </text>
                    <text x="65" y="32" fill="var(--primary)" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                      {batteryDischarge.toFixed(1)} kW | SoC {batterySoc}%
                    </text>
                    <text x="65" y="44" fill="currentColor" opacity="0.5" fontSize="8" textAnchor="middle">
                      20.0 kWh LiFePO4
                    </text>
                  </g>

                  {/* Node 4: Critical Facility Loads (Top Right) */}
                  <g transform="translate(530, 25)">
                    <rect
                      width="130"
                      height="65"
                      rx="8"
                      fill="var(--card-bg)"
                      stroke="var(--card-border)"
                      strokeWidth="1.5"
                    />
                    <text x="65" y="24" fill="currentColor" fontSize="11" fontWeight="700" textAnchor="middle">
                      Critical Loads
                    </text>
                    <text x="65" y="42" fill="var(--primary)" fontSize="12" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                      {Math.min(currentEffectiveLoad, peakThreshold).toFixed(1)} kW
                    </text>
                    <text x="65" y="56" fill="currentColor" opacity="0.6" fontSize="9" textAnchor="middle">
                      Servers / Lighting / Med
                    </text>
                  </g>

                  {/* Node 5: Smart Deferred Loads (Bottom Right) */}
                  <g transform="translate(530, 125)">
                    <rect
                      width="130"
                      height="65"
                      rx="8"
                      fill="var(--card-bg)"
                      stroke="var(--card-border)"
                      strokeWidth="1.5"
                    />
                    <text x="65" y="24" fill="currentColor" fontSize="11" fontWeight="700" textAnchor="middle">
                      Deferred Loads
                    </text>
                    <text x="65" y="42" fill="#f59e0b" fontSize="12" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                      {deferredLoad.toFixed(1)} kW Shifted
                    </text>
                    <text x="65" y="56" fill="currentColor" opacity="0.6" fontSize="9" textAnchor="middle">
                      EV Fleet / HVAC Cycle
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: AI Co-Pilot Assistant */}
          <div>
            <div className="copilot-panel">
              {/* Header */}
              <div className="copilot-header">
                <div className="copilot-brand">
                  <FiCpu style={{ color: "var(--primary)", fontSize: "1.2rem" }} />
                  <span>EcoSplit AI Co-Pilot</span>
                </div>
                <span className="copilot-meta-pill">NeuralSplit-v2.4</span>
              </div>

              {/* 4 Executable Quick Prompt Pills */}
              <div className="prompt-pills-wrap">
                <div className="pills-label">Executable Energy Diagnostic Actions</div>
                <div className="pills-grid">
                  <button
                    className="pill-action-btn"
                    onClick={() => executeAiCommand("optimize")}
                    disabled={isAiThinking}
                  >
                    ⚡ Optimize for peak tariff
                  </button>
                  <button
                    className="pill-action-btn"
                    onClick={() => executeAiCommand("diagnose")}
                    disabled={isAiThinking}
                  >
                    🔍 Diagnose load anomaly
                  </button>
                  <button
                    className="pill-action-btn"
                    onClick={() => executeAiCommand("outage")}
                    disabled={isAiThinking}
                  >
                    ⚠️ Simulate grid outage
                  </button>
                  <button
                    className="pill-action-btn"
                    onClick={() => executeAiCommand("forecast")}
                    disabled={isAiThinking}
                  >
                    📈 Forecast tomorrow peak
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="copilot-stream" ref={chatScrollRef}>
                {messages.map((m) => (
                  <div key={m.id} className={`chat-bubble ${m.sender}`}>
                    <div className="bubble-meta">
                      <span>{m.sender === "copilot" ? "NeuralSplit-v2.4" : "Operator"}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                      {m.latencyMs && (
                        <>
                          <span>•</span>
                          <span style={{ color: "var(--primary)" }}>{m.latencyMs}ms</span>
                        </>
                      )}
                    </div>
                    <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
                    {m.metrics && (
                      <div className="bubble-metrics-tag">
                        <div>Action: {m.metrics.action}</div>
                        <div>
                          Avoided Cost: ${m.metrics.avoidedCostHourly.toFixed(2)}/hr | Shaved:{" "}
                          {m.metrics.shavedKw.toFixed(1)} kW ({m.metrics.savingsPct.toFixed(1)}%)
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isAiThinking && (
                  <div className="chat-bubble copilot">
                    <span className="thinking-indicator">
                      <FiRefreshCw className="spin" style={{ animation: "spin 1s linear infinite" }} />
                      NeuralSplit analyzing real-time telemetry stream...
                    </span>
                  </div>
                )}
              </div>

              {/* Natural Language Prompt Input Form */}
              <form onSubmit={handleSendMessage} className="copilot-input-form">
                <input
                  type="text"
                  placeholder="Ask query or type command (e.g. 'set threshold to 6 kW')..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  className="copilot-input"
                  disabled={isAiThinking}
                />
                <button
                  type="submit"
                  className="copilot-submit-btn"
                  disabled={!inputPrompt.trim() || isAiThinking}
                  aria-label="Send Command"
                >
                  <FiSend />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
