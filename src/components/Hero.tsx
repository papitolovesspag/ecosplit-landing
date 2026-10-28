"use client";

import React from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

interface HeroProps {
  onOpenConsole?: () => void;
}

export default function Hero(props: HeroProps) {
  const handleOpenConsole = () => {
    if (props.onOpenConsole) {
      props.onOpenConsole();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-launch-console"));
    }
  };

  return (
    <section id="hero" className="section-hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-text">
            <div className="badge-pill hero-badge">
              <span className="live-pulse-dot"></span>
              <span>Enterprise CleanTech SaaS &bull; Live Telemetry</span>
            </div>
            <h1 className="hero-title">
              Autonomous Energy Load Splitting with <span>EcoSplit AI</span>
            </h1>
            <p className="hero-subtitle">
              Autonomous real-time energy load splitting &amp; tariff arbitrage. EcoSplit AI combines time-series neural forecasting (&lt;120ms) with OpenADR cloud telemetry to slash peak demand charges by up to 45%.
            </p>
            <div className="hero-actions">
              <Link href="/demo" className="btn-cta btn-primary btn-hero-launch">
                Launch App <FiArrowRight />
              </Link>
              <a href="#how-it-works" className="btn-cta btn-secondary">
                Explore Demo
              </a>
              <button 
                type="button" 
                className="btn-cta btn-outline"
                onClick={handleOpenConsole}
              >
                Launch Console
              </button>
              <a href="#contact-us" className="btn-cta btn-outline">
                Get Started
              </a>
            </div>

            <div className="hero-trust-badges">
              <div className="trust-item">
                <FiCheckCircle className="font-green" />
                <span>Zero-Touch Cloud Sync</span>
              </div>
              <div className="trust-item">
                <FiCheckCircle className="font-cyan" />
                <span>OpenADR 2.0b Certified</span>
              </div>
              <div className="trust-item">
                <FiCheckCircle className="font-green" />
                <span>Tesla &amp; Enphase APIs</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="glass-card hero-glass-card">
              <div className="card-header">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="card-title">Live Neural Optimization</span>
                <span className="card-badge-live font-mono">NeuralSplit-v2.4</span>
              </div>
              <div className="card-body">
                <div className="neural-latency-strip font-mono" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="live-pulse-dot"></span> P99 Inference Latency
                  </span>
                  <span className="font-cyan" style={{ fontWeight: 600 }}>84ms (&lt;120ms SLA)</span>
                </div>

                <div className="saving-value font-cyan">42.8%</div>
                <p className="saving-label">Active Load Split Efficiency</p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: "85%" }}></div>
                </div>
                <div className="stats-row">
                  <div>
                    <span className="stat-label">Grid Load</span>
                    <span className="stat-val font-cyan">4.2 kW</span>
                  </div>
                  <div>
                    <span className="stat-label">AI Load Splitting</span>
                    <span className="stat-val font-green">Active</span>
                  </div>
                </div>

                <div className="hero-card-footer">
                  <Link href="/demo" className="hero-simulator-link">
                    Open Live Interactive Simulator <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
