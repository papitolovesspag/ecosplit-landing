"use client";

import React from "react";
import { FiArrowRight } from "react-icons/fi";

export default function Hero() {
  return (
    <section id="hero" className="section-hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">
              Intelligent Energy Splitting with <span>EcoSplit AI</span>
            </h1>
            <p className="hero-subtitle">
              De-risk your energy bills. EcoSplit AI uses advanced split logic to dynamically balance energy loads, saving up to 45% on smart grid consumption.
            </p>
            <div className="hero-actions">
              <a href="#contact-us" className="btn-cta btn-primary">
                Get Started <FiArrowRight />
              </a>
              <a href="#how-it-works" className="btn-cta btn-secondary">
                Explore Demo
              </a>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="glass-card hero-glass-card">
              <div className="card-header">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="card-title">Live Saving Dashboard</span>
              </div>
              <div className="card-body">
                <div className="saving-value">42.8%</div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
