"use client";

import React, { useState } from "react";
import {
  FiCode,
  FiTerminal,
  FiCopy,
  FiCheck,
  FiLayers,
  FiShield,
  FiArrowRight,
  FiZap,
  FiRadio,
  FiKey,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";
import Link from "next/link";

interface ApiShowcaseProps {
  onOpenConsole?: () => void;
}

interface WebhookEventData {
  id: string;
  eventName: string;
  description: string;
  headerSignature: string;
  samplePayload: string;
}

const webhookEvents: WebhookEventData[] = [
  {
    id: "telemetry.ingested",
    eventName: "telemetry.ingested",
    description: "Fires when 1Hz smart meter telemetry is successfully validated and buffered in edge cache.",
    headerSignature: "X-EcoSplit-Signature: t=1730079600,v1=4d8a1e84c9f12b07d6a4e320f83c11e7a9b0",
    samplePayload: `{
  "event": "telemetry.ingested",
  "gateway_id": "gw_tesla_pw_4821",
  "timestamp": "2026-10-28T01:30:00Z",
  "data": {
    "active_power_kw": 8.45,
    "reactive_power_kvar": 1.12,
    "voltage_v": 240.2,
    "battery_soc_pct": 78.5,
    "grid_frequency_hz": 60.01
  }
}`,
  },
  {
    id: "tariff.price_spike_forecasted",
    eventName: "tariff.price_spike_forecasted",
    description: "Fires when the Temporal Fusion Transformer flags a >90% probability of an ISO tariff spike in the next 1–4 hours.",
    headerSignature: "X-EcoSplit-Signature: t=1730079612,v1=9e82a4c1f57b60c3d9a10f8234e12cba50ef",
    samplePayload: `{
  "event": "tariff.price_spike_forecasted",
  "iso_region": "CAISO",
  "timestamp": "2026-10-28T01:30:12Z",
  "forecast": {
    "projected_peak_tariff_usd_kwh": 0.62,
    "baseline_tariff_usd_kwh": 0.18,
    "spike_window_start": "2026-10-28T16:00:00Z",
    "spike_window_end": "2026-10-28T20:00:00Z",
    "recommended_pre_charge_kwh": 8.2
  }
}`,
  },
  {
    id: "split.executed",
    eventName: "split.executed",
    description: "Dispatched whenever the MILP solver writes automated charge/discharge setpoints to active inverters.",
    headerSignature: "X-EcoSplit-Signature: t=1730079624,v1=c3f1409ab7d45e12089ef01a2345bcdef901",
    samplePayload: `{
  "event": "split.executed",
  "decision_id": "dec_8f17a932b",
  "timestamp": "2026-10-28T01:30:24Z",
  "execution": {
    "grid_import_kw": 2.10,
    "battery_discharge_kw": 6.35,
    "cost_avoided_hourly_usd": 3.05,
    "carbon_offset_kg_hr": 2.41,
    "inverter_throttle_ratio": 0.655,
    "latency_ms": 84.2
  }
}`,
  },
  {
    id: "openadr.dr_event_triggered",
    eventName: "openadr.dr_event_triggered",
    description: "Fires when an incoming OpenADR 2.0b demand response event is validated and mapped to Virtual End Node (VEN) curtailment.",
    headerSignature: "X-EcoSplit-Signature: t=1730079636,v1=7a29e4b601d8f5c3a45e9021bc87321045da",
    samplePayload: `{
  "event": "openadr.dr_event_triggered",
  "event_id": "DR_2026_PEAK_04",
  "timestamp": "2026-10-28T01:30:36Z",
  "ven_details": {
    "signal_type": "DISTRIBUTE",
    "curtailment_target_kw": 4.5,
    "duration_minutes": 120,
    "ven_status": "ACKNOWLEDGED_OPT_IN",
    "estimated_incentive_usd": 18.40
  }
}`,
  },
];

export default function ApiShowcase({ onOpenConsole }: ApiShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"curl" | "typescript" | "python">("curl");
  const [copied, setCopied] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string>("split.executed");

  const codeSnippets = {
    curl: [
      'curl -X POST https://api.ecosplitai.com/v1/telemetry/split \\',
      '  -H "Authorization: Bearer eco_live_948f2ca817b" \\',
      '  -H "Content-Type: application/json" \\',
      '  -d \'{',
      '    "gateway_id": "gw_tesla_pw_4821",',
      '    "current_load_kw": 8.45,',
      '    "battery_soc_pct": 78.5,',
      '    "grid_tariff_usd_kwh": 0.48,',
      '    "openadr_signal": "MODERATE_PEAK"',
      '  }\'',
    ].join('\n'),
    typescript: [
      'import { EcoSplitClient } from "@ecosplit/sdk";',
      '',
      'const client = new EcoSplitClient({',
      '  apiKey: process.env.ECOSPLIT_API_KEY, // "eco_live_948f2ca817b"',
      '  environment: "production"',
      '});',
      '',
      '// Stream real-time smart meter telemetry to neural optimizer (<120ms latency)',
      'const split = await client.telemetry.computeSplit({',
      '  gatewayId: "gw_tesla_pw_4821",',
      '  currentLoadKw: 8.45,',
      '  batterySocPct: 78.5,',
      '  gridTariffUsdKwh: 0.48,',
      '  openadrSignal: "MODERATE_PEAK"',
      '});',
      '',
      'console.log(`Optimal Battery Discharge: ${split.recommendation.battery_discharge_kw} kW`);',
      'console.log(`Avoided Cost: $${split.recommendation.cost_avoided_hourly_usd}/hr | Latency: ${split.inference_latency_ms}ms`);',
    ].join('\n'),
    python: [
      'import os',
      'from ecosplit import EcoSplitClient',
      '',
      'client = EcoSplitClient(api_key=os.getenv("ECOSPLIT_API_KEY"))',
      '',
      '# Trigger real-time load split computation across microgrid edge',
      'response = client.telemetry.compute_split(',
      '    gateway_id="gw_tesla_pw_4821",',
      '    current_load_kw=8.45,',
      '    battery_soc_pct=78.5,',
      '    grid_tariff_usd_kwh=0.48,',
      '    openadr_signal="MODERATE_PEAK"',
      ')',
      '',
      'print(f"Status: {response.status} (Engine: {response.engine})")',
      'print(f"Discharged: {response.recommendation.battery_discharge_kw} kW")',
      'print(f"Hourly Savings: ${response.recommendation.cost_avoided_hourly_usd} (Latency: {response.inference_latency_ms}ms)")',
    ].join('\n'),
  };

  const webhookVerifySnippet = [
    'import crypto from "crypto";',
    '',
    'export function verifyEcoSplitWebhook(',
    '  rawBody: string,',
    '  signatureHeader: string,',
    '  secret: string',
    '): boolean {',
    '  // Extract timestamp and signature hash',
    '  const parts = Object.fromEntries(',
    '    signatureHeader.split(",").map(part => part.split("="))',
    '  );',
    '  ',
    '  const expected = crypto',
    '    .createHmac("sha256", secret)',
    '    .update(`${parts.t}.${rawBody}`)',
    '    .digest("hex");',
    '',
    '  return crypto.timingSafeEqual(',
    '    Buffer.from(parts.v1),',
    '    Buffer.from(expected)',
    '  );',
    '}',
  ].join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeWebhookData =
    webhookEvents.find((w) => w.id === selectedWebhook) || webhookEvents[2];

  return (
    <section id="api-integrations" className="section-api-showcase">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="badge-pill">
            <FiCode className="badge-icon" />
            <span>DEVELOPER-FIRST CLOUD PLATFORM</span>
          </div>
          <h2 className="section-title">
            Zero-Touch API &amp; <span>Microgrid Hardware Connectors</span>
          </h2>
          <p className="section-subtitle">
            Seamlessly integrate EcoSplit&apos;s neural load splitting engine into your IoT gateways, multi-tenant property management platforms, or utility grid dispatchers with clean REST APIs, Webhooks, and automated telemetry ingestion.
          </p>
        </div>

        {/* Interactive Multi-Language Code Snippet Card */}
        <div className="api-code-grid">
          {/* Request Card */}
          <div className="api-code-card glass-card">
            <div className="code-header">
              <div className="code-tabs">
                <button
                  className={`code-tab ${activeTab === "curl" ? "active" : ""}`}
                  onClick={() => setActiveTab("curl")}
                  aria-label="View cURL snippet"
                >
                  <FiTerminal /> cURL
                </button>
                <button
                  className={`code-tab ${activeTab === "typescript" ? "active" : ""}`}
                  onClick={() => setActiveTab("typescript")}
                  aria-label="View TypeScript snippet"
                >
                  TypeScript / Node.js
                </button>
                <button
                  className={`code-tab ${activeTab === "python" ? "active" : ""}`}
                  onClick={() => setActiveTab("python")}
                  aria-label="View Python snippet"
                >
                  Python
                </button>
              </div>
              <button
                className="btn-copy"
                onClick={handleCopy}
                aria-label="Copy code snippet to clipboard"
              >
                {copied ? <FiCheck className="font-green" /> : <FiCopy />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <div className="code-body">
              <pre>
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>
            <div className="code-footer">
              <span className="endpoint-method">POST</span>
              <span className="endpoint-path">/v1/telemetry/split</span>
              <span className="auth-badge">Bearer Auth</span>
            </div>
          </div>

          {/* Formatted Response Window */}
          <div className="api-response-card glass-card">
            <div className="response-header">
              <div className="response-status-wrap">
                <span className="dot dot-green"></span>
                <span className="response-title">HTTP 200 OK — Real-time Split Recommendation</span>
              </div>
              <span className="latency-badge font-cyan">84.2 ms</span>
            </div>
            <div className="response-body">
              <pre>
                <code>{`{
  "status": "optimized",
  "recommendation": {
    "grid_import_kw": 2.10,
    "battery_discharge_kw": 6.35,
    "cost_avoided_hourly_usd": 3.05,
    "carbon_offset_kg_hr": 2.41
  },
  "inference_latency_ms": 84.2,
  "engine": "NeuralSplit-v2.4"
}`}</code>
              </pre>
            </div>
            <div className="response-footer">
              <div className="response-stat">
                <span className="stat-name">Engine:</span>
                <span className="stat-val font-cyan">NeuralSplit-v2.4</span>
              </div>
              <div className="response-stat">
                <span className="stat-name">Inference Latency:</span>
                <span className="stat-val font-green">84.2 ms</span>
              </div>
              <div className="response-stat">
                <span className="stat-name">State:</span>
                <span className="stat-val font-green">Deterministic Setpoint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Built Hardware & Inverter Connectors Grid (4 Enterprise Cards) */}
        <div className="connectors-header">
          <div className="badge-pill inline-badge">
            <FiLayers />
            <span>OEM &amp; STANDARD HARDWARE COMPATIBILITY</span>
          </div>
          <h3>Pre-Built Hardware &amp; Inverter Connectors</h3>
          <p>
            Zero-touch cloud synchronization and local gateway polling with industry-standard energy storage, microinverters, and utility protocols.
          </p>
        </div>

        <div className="connectors-grid">
          {/* Card 1: OpenADR 2.0b */}
          <div className="connector-card glass-card">
            <div className="connector-top">
              <div className="connector-icon-wrap">
                <FiShield className="connector-icon font-green" />
              </div>
              <span className="connector-badge font-green">VEN / VTN Certified</span>
            </div>
            <h4>OpenADR 2.0b</h4>
            <p>
              Certified Virtual End Node (VEN) &amp; Virtual Top Node (VTN) automated demand response compliance for utility peak-event shedding and automated load curtailment.
            </p>
            <div className="connector-meta">
              <span>● OpenADR 2.0b Profile B</span>
              <span>● XML &amp; JSON Endpoints</span>
            </div>
          </div>

          {/* Card 2: Tesla Powerwall & Energy API */}
          <div className="connector-card glass-card">
            <div className="connector-top">
              <div className="connector-icon-wrap">
                <FiZap className="connector-icon font-cyan" />
              </div>
              <span className="connector-badge font-cyan">Fleet API v3 Active</span>
            </div>
            <h4>Tesla Powerwall &amp; Energy API</h4>
            <p>
              Bidirectional telemetry streaming, active SoC monitoring, automated storm-mode reserve overrides, and dynamic tariff charge/discharge scheduling.
            </p>
            <div className="connector-meta">
              <span>● Cloud OAuth 2.0 PKCE</span>
              <span>● Dynamic Reserve Control</span>
            </div>
          </div>

          {/* Card 3: Enphase Enlighten */}
          <div className="connector-card glass-card">
            <div className="connector-top">
              <div className="connector-icon-wrap">
                <FiRadio className="connector-icon font-green" />
              </div>
              <span className="connector-badge font-green">1-Min Gateway Sync</span>
            </div>
            <h4>Enphase Enlighten</h4>
            <p>
              Microinverter array telemetry, IQ Gateway polling at 1-minute intervals, real-time solar generation curves, and active net-metering optimization.
            </p>
            <div className="connector-meta">
              <span>● IQ Gateway Local &amp; Cloud</span>
              <span>● 1Hz Sub-Panel Polling</span>
            </div>
          </div>

          {/* Card 4: SolarEdge Cloud */}
          <div className="connector-card glass-card">
            <div className="connector-top">
              <div className="connector-icon-wrap">
                <FiLayers className="connector-icon font-cyan" />
              </div>
              <span className="connector-badge font-cyan">Modbus TCP &amp; REST</span>
            </div>
            <h4>SolarEdge Cloud</h4>
            <p>
              Commercial inverter Modbus and REST telemetry for multi-kW solar arrays, supporting high-throughput commercial installations and curtailment controls.
            </p>
            <div className="connector-meta">
              <span>● Commercial Modbus SunSpec</span>
              <span>● Real-time Export Limiting</span>
            </div>
          </div>
        </div>

        {/* Webhook & Event Streaming Box */}
        <div className="webhook-box glass-card">
          <div className="webhook-header">
            <div className="webhook-title-wrap">
              <div className="badge-pill inline-badge">
                <FiLock className="font-cyan" />
                <span>CRYPTOGRAPHIC VERIFICATION</span>
              </div>
              <h3>Webhooks &amp; Event-Driven Grid Streaming</h3>
              <p>
                Subscribe your cloud infrastructure or SCADA systems to mission-critical grid events with sub-second delivery and tamper-proof SHA-256 HMAC cryptographic signatures via the <code>X-EcoSplit-Signature</code> header.
              </p>
            </div>
            <div className="webhook-hmac-badge">
              <FiCheckCircle className="font-green" />
              <span>SHA-256 HMAC Signed (X-EcoSplit-Signature)</span>
            </div>
          </div>

          {/* Event Picker Pills */}
          <div className="webhook-event-tabs">
            {webhookEvents.map((evt) => (
              <button
                key={evt.id}
                className={`webhook-tab-btn ${selectedWebhook === evt.id ? "active" : ""}`}
                onClick={() => setSelectedWebhook(evt.id)}
              >
                <span className="evt-dot"></span>
                <code>{evt.eventName}</code>
              </button>
            ))}
          </div>

          {/* Active Event Payload & Verification Code */}
          <div className="webhook-details-grid">
            <div className="webhook-payload-col">
              <div className="webhook-col-header">
                <span>Webhook Payload: <code>{activeWebhookData.eventName}</code></span>
                <span className="webhook-desc-sm">{activeWebhookData.description}</span>
              </div>
              <div className="webhook-signature-header">
                <code>{activeWebhookData.headerSignature}</code>
              </div>
              <div className="webhook-json-body">
                <pre>
                  <code>{activeWebhookData.samplePayload}</code>
                </pre>
              </div>
            </div>

            <div className="webhook-verify-col">
              <div className="webhook-col-header">
                <span>Signature Verification Example (Node.js)</span>
              </div>
              <div className="webhook-verify-code">
                <pre>
                  <code>{webhookVerifySnippet}</code>
                </pre>
              </div>
              <div className="webhook-benefits">
                <div className="benefit-item">
                  <FiCheck className="font-green" />
                  <span>Replay-attack resistant (timestamped)</span>
                </div>
                <div className="benefit-item">
                  <FiCheck className="font-green" />
                  <span>Constant-time signature comparison</span>
                </div>
                <div className="benefit-item">
                  <FiCheck className="font-green" />
                  <span>Sub-250ms worldwide webhook delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="api-actions-center">
          <Link href="/demo" className="btn-cta btn-primary">
            Explore Simulator &amp; API Sandbox <FiArrowRight />
          </Link>
          {onOpenConsole && (
            <button className="btn-cta btn-secondary" onClick={onOpenConsole}>
              <FiKey /> Provision Developer API Key
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
