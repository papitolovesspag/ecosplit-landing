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
            <h2>Contact Our Team</h2>
            <p>Have questions about integrating EcoSplit AI with your smart meter? Drop us a line or connect with us directly.</p>
            
            <div className="contact-links">
              <div className="contact-link-item email-link">
                <FiMail className="contact-icon" />
                <a href="mailto:xavier@ecosplitai.site">xavier@ecosplitai.site</a>
              </div>
              <div className="contact-link-item phone-link">
                <FiPhone className="contact-icon" />
                <a href="tel:+2349058217277">+234 905 821 7277</a>
              </div>
              <div className="contact-link-item linkedin-link">
                <FiLinkedin className="contact-icon" />
                <a href="https://www.linkedin.com/in/kosisochukwu-chinze-6bb0583aa" target="_blank" rel="noopener noreferrer">
                  Connect on LinkedIn
                </a>
              </div>
              <div className="contact-link-item github-link">
                <FiGithub className="contact-icon" />
                <a href="https://github.com/papitoloesspag" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper glass-card">
            {formSubmitted ? (
              <div className="success-message">
                <FiCheckCircle className="success-icon" />
                <h3>Submission Success!</h3>
                <p>Thank you for reaching out, {formData.name}. Our AI specialist will email you at {formData.email} within 24 hours.</p>
              </div>
            ) : (
              <form id="contact-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name-input">Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    name="name"
                    placeholder="Jane Doe"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email-input">Email Address</label>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    placeholder="jane@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message-input">Message</label>
                  <textarea
                    id="message-input"
                    name="message"
                    rows={4}
                    placeholder="Tell us about your home smart setup..."
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="btn-submit">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
