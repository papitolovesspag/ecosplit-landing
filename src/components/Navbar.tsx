"use client";

import React, { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Determine initial theme: check localStorage, otherwise default to dark
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "dark";
    document.documentElement.setAttribute("data-theme", initialTheme);
    
    const t = setTimeout(() => {
      setTheme(initialTheme);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "how-it-works", "about-us", "pricing", "contact-us"];
      let currentSection = "hero";
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the section top is above the middle of the viewport, consider it active
          if (rect.top <= window.innerHeight / 2) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // run once on load
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <header>
      <div className="nav-container">
        <a href="#hero" className="logo">
          EcoSplit <span>AI</span>
        </a>
        <nav className={`nav-menu ${isMobileMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li>
              <a 
                href="#how-it-works" 
                className={activeSection === "how-it-works" ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
            </li>
            <li>
              <a 
                href="#about-us" 
                className={activeSection === "about-us" ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="#pricing" 
                className={activeSection === "pricing" ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
            </li>
            <li>
              <a 
                href="#contact-us" 
                className={activeSection === "contact-us" ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </a>
            </li>
          </ul>
          <button
            id="theme-toggle"
            className="theme-toggle-btn"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <FiMoon className="icon-moon" />
            ) : (
              <FiSun className="icon-sun" />
            )}
          </button>
        </nav>
        <button className={`hamburger-menu ${isMobileMenuOpen ? "open" : ""}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </header>
  );
}
