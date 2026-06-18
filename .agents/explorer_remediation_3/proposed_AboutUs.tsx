"use client";

import React, { useState } from "react";
import { FiInfo, FiLinkedin, FiGithub } from "react-icons/fi";

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
              To democratize intelligent energy management. We empower homeowners and businesses to participate in demand-response programs automatically, reducing global carbon emissions one split at a time.
            </p>
            <div className="about-values">
              <div className="value-item">
                <FiInfo className="value-icon" />
                <span>45% Maximum energy savings</span>
              </div>
              <div className="value-item">
                <FiInfo className="value-icon" />
                <span>Real-time smart grid balancing</span>
              </div>
            </div>
          </div>

          {/* Founder Profile Card */}
          <div className="team-member glass-card founder-profile">
            <div className="founder-header">
              <div className="avatar-placeholder founder-image" data-testid="founder-image">
                <svg viewBox="0 0 100 100" className="founder-svg-logo">
                  <circle cx="50" cy="50" r="45" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="2" />
                  <path d="M50 25 A 15 15 0 0 1 50 55 A 15 15 0 0 1 50 25 Z" fill="var(--primary)" />
                  <path d="M20 80 Q 50 50 80 80" fill="none" stroke="var(--primary)" strokeWidth="4" />
                </svg>
              </div>
              <div className="founder-info">
                <h3>Dr. Chidi</h3>
                <p className="founder-role">Founder & Chief Energy Architect</p>
              </div>
            </div>
            
            <p className="founder-bio-short founder-bio" data-testid="founder-bio">
              Dr. Chidi is a grid-systems researcher who created EcoSplit AI to bridge the gap between complex power system dynamics and residential smart meters.
            </p>

            <button 
              className="toggle-bio read-more-btn"
              onClick={() => setBioExpanded(!bioExpanded)}
            >
              {bioExpanded ? "Show Less" : "Read Full Bio"}
            </button>

            <div className={`bio-expanded ${bioExpanded ? "visible" : "hidden"}`}>
              <p>
                With over 12 years of experience in smart-grid research and AI optimization, Dr. Chidi holds a Ph.D. in Electrical Engineering. His work focuses on load synchronization algorithms that minimize thermal dissipation in localized transformers.
              </p>
            </div>

            <div className="founder-socials">
              <a href="https://linkedin.com/in/chidi-ecosplit" className="social-link" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="https://twitter.com/chidi_ecosplit" className="social-link" aria-label="Twitter">
                <FiGithub />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
