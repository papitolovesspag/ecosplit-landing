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
                <img src="/assets/headshot.jpg" alt="Kosi - Founder" style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
              </div>
              <div className="founder-info">
                <h3>Xavier</h3>
                <p className="founder-role">Founder & Mechatronics Engineering Student</p>
              </div>
            </div>
            
            <p className="founder-bio-short founder-bio" data-testid="founder-bio">
              Xavier is a Mechatronics Engineering student at the University of Nigeria Nsukka. He has been writing code since he was 14 and created EcoSplit AI with a dedication to changing the world around him and beyond.
            </p>

            <button 
              className="toggle-bio read-more-btn"
              onClick={() => setBioExpanded(!bioExpanded)}
            >
              {bioExpanded ? "Show Less" : "Read Full Bio"}
            </button>

            <div className={`bio-expanded ${bioExpanded ? "visible" : "hidden"}`}>
              <p>
                Combining his deep background in hardware engineering and software development, Xavier bridges the gap between complex power system dynamics and intuitive residential smart meters. His innovative approach to problem-solving and years of hands-on coding experience allow him to build scalable, AI-driven architectures that democratize intelligent energy management.
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
