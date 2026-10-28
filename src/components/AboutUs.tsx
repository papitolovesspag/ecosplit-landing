"use client";

import React, { useState } from "react";
import { FiInfo, FiLinkedin, FiGithub, FiCheckCircle } from "react-icons/fi";

export default function AboutUs() {
  const [bioExpanded, setBioExpanded] = useState(false);

  return (
    <section id="about-us" className="section-about">
      <div className="container">
        <div className="about-grid">
          {/* Mission Card */}
          <div className="about-card glass-card">
            <h2>Our Mission</h2>
            <p className="mission-text" data-testid="mission-statement">
              To democratize intelligent energy management. We empower commercial operators, utilities, and clean energy fleets to participate in autonomous demand-response programs, mitigating peak grid stress and accelerating the transition to a zero-carbon power grid.
            </p>
            <div className="about-values">
              <div className="value-item">
                <FiInfo className="value-icon" />
                <span>45% Maximum peak load demand reduction</span>
              </div>
              <div className="value-item">
                <FiInfo className="value-icon" />
                <span>Autonomous, zero-touch smart grid balancing</span>
              </div>
              <div className="value-item">
                <FiCheckCircle className="value-icon font-cyan" />
                <span>OpenADR 2.0b &amp; ISO-compliant VPP protocol</span>
              </div>
            </div>
          </div>

          {/* Founder Profile Card */}
          <div className="team-member glass-card founder-profile">
            <div className="founder-header">
              <div className="avatar-placeholder founder-image" data-testid="founder-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/assets/headshot.jpg" 
                  alt="Founder & Chief Architect - Xavier" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} 
                />
              </div>
              <div className="founder-info">
                <h3>Xavier</h3>
                <p className="founder-role">Founder &amp; Chief Architect</p>
              </div>
            </div>
            
            <p className="founder-bio-short founder-bio" data-testid="founder-bio">
              Xavier is the Founder &amp; Chief Architect of EcoSplit AI. With extensive background across full-stack AI/ML systems, distributed grid telemetry, and power systems engineering, he designs autonomous edge-and-cloud algorithms that orchestrate high-throughput power loads with sub-120ms neural inference.
            </p>

            <button 
              type="button"
              className="toggle-bio read-more-btn"
              onClick={() => setBioExpanded(!bioExpanded)}
              aria-expanded={bioExpanded}
            >
              {bioExpanded ? "Show Less" : "Read Full Bio"}
            </button>

            <div className={`bio-expanded ${bioExpanded ? "visible" : "hidden"}`}>
              <p>
                Combining deep expertise in electric power systems and scalable cloud architectures, Xavier specializes in real-time time-series neural forecasting, OpenADR 2.0b demand-response orchestration, and automated hardware telemetry across Tesla Powerwall, Enphase, and SolarEdge gateways. Xavier created EcoSplit AI to pioneer autonomous, zero-touch energy arbitrage for modern virtual power plants and distributed energy resources.
              </p>
            </div>

            <div className="founder-socials">
              <a href="https://www.linkedin.com/in/kosisochukwu-chinze-6bb0583aa" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="https://github.com/papitoloesspag" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <FiGithub />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
