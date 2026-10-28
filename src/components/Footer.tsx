"use client";

import React from "react";
import Link from "next/link";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link href="/" className="logo footer-logo">
              EcoSplit <span>AI</span>
            </Link>
            <p className="footer-tagline">
              Autonomous grid load splitting, neural time-series tariff arbitrage, and clean energy optimization SaaS platform.
            </p>
            <div className="status-pill-footer">
              <span className="live-dot-green"></span>
              <span>All Systems Operational | Average API Latency: 114ms</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Product</h4>
            <ul>
              <li><Link href="/demo">Live MVP Simulator</Link></li>
              <li><a href="#architecture">AI Engine Architecture</a></li>
              <li><a href="#api-integrations">API &amp; Telemetry</a></li>
              <li><a href="#pricing">Pricing Plans</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Integrations</h4>
            <ul>
              <li><a href="#api-integrations">OpenADR 2.0b VEN</a></li>
              <li><a href="#api-integrations">Tesla Fleet &amp; Powerwall</a></li>
              <li><a href="#api-integrations">Enphase IQ Cloud</a></li>
              <li><a href="#api-integrations">SolarEdge Modbus</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Company &amp; Trust</h4>
            <ul>
              <li><a href="#about-us">About Us</a></li>
              <li><a href="#about-us">Founder &amp; Chief Architect</a></li>
              <li><a href="#contact-us">Enterprise Sales</a></li>
              <li><a href="#contact-us">SOC2 &amp; Grid Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} EcoSplit AI Ltd. All rights reserved. Built for scalable smart grid efficiency.
          </p>
          <div className="footer-social-links">
            <a href="https://github.com/papitoloesspag" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href="https://www.linkedin.com/in/kosisochukwu-chinze-6bb0583aa" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
            <a href="mailto:xavier@ecosplitai.site" aria-label="Email">
              <FiMail />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
