"use client";

import React, { useState } from "react";
import { FiMail, FiPhone, FiLinkedin, FiGithub, FiCheckCircle } from "react-icons/fi";

export default function ContactUs() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section id="contact-us" className="section-contact">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Enterprise Sales, Utility Partnerships &amp; Developer API Support</h2>
            <p>Ready to deploy EcoSplit AI across your fleet or integrate our real-time telemetry API? Connect with our systems engineering and partnerships team.</p>
            
            <div className="contact-links">
              <div className="contact-link-item email-link">
                <FiMail className="contact-icon email" />
                <a href="mailto:xavier@ecosplitai.site" className="email">xavier@ecosplitai.site</a>
              </div>
              <div className="contact-link-item phone-link">
                <FiPhone className="contact-icon phone" />
                <a href="tel:+2349058217277" className="phone">+234 905 821 7277</a>
              </div>
              <div className="contact-link-item linkedin-link">
                <FiLinkedin className="contact-icon linkedin" />
                <a href="https://www.linkedin.com/in/kosisochukwu-chinze-6bb0583aa" target="_blank" rel="noopener noreferrer" className="linkedin">
                  Connect on LinkedIn
                </a>
              </div>
              <div className="contact-link-item github-link">
                <FiGithub className="contact-icon github" />
                <a href="https://github.com/papitoloesspag" target="_blank" rel="noopener noreferrer" className="github">
                  GitHub Organization
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper glass-card">
            {formSubmitted ? (
              <div className="success-message">
                <FiCheckCircle className="success-icon" />
                <h3>Submission Success!</h3>
                <p>Thank you for reaching out, {formData.name}. Our enterprise solutions architecture team has received your inquiry and will provision your evaluation credentials within 24 hours.</p>
              </div>
            ) : (
              <form id="contact-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name-input">Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    name="name"
                    placeholder="Dr. Elena Vance"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email-input">Work Email Address</label>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    placeholder="elena@gridutility.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message-input">Fleet Capacity &amp; API Integration Scope</label>
                  <textarea
                    id="message-input"
                    name="message"
                    rows={4}
                    placeholder="Describe your grid infrastructure, fleet capacity (kW/MW), or API integration requirements..."
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="btn-cta btn-primary btn-submit">
                  Send Enterprise Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
