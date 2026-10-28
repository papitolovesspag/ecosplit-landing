"use client";

import React, { useEffect, useState } from "react";
import { FiSun, FiMoon, FiArrowRight, FiTerminal } from "react-icons/fi";
import Link from "next/link";

interface NavbarProps {
  onOpenConsole?: () => void;
}

export default function Navbar({ onOpenConsole }: NavbarProps) {
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
      const sections = ["hero", "architecture", "how-it-works", "api-integrations", "pricing", "about-us", "contact-us"];
      let currentSection = "hero";
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleSignInClick = () => {
    setIsMobileMenuOpen(false);
    if (onOpenConsole) {
      onOpenConsole();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-launch-console"));
    }
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
                href="#architecture" 
                className={activeSection === "architecture" ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Engine
              </a>
            </li>
            <li>
              <a 
                href="#api-integrations" 
                className={activeSection === "api-integrations" ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                API &amp; Telemetry
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
                href="#about-us" 
                className={activeSection === "about-us" ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
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

          <div className="nav-actions">
            <button 
              type="button" 
              className="btn-nav-signin"
              onClick={handleSignInClick}
              aria-label="Sign In to Cloud Console"
            >
              <FiTerminal /> Sign In
            </button>

            <Link 
              href="/demo" 
              className="btn-nav-launch"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Launch App <FiArrowRight />
            </Link>

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
          </div>
        </nav>
        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? "open" : ""}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          aria-label="Toggle Menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </header>
  );
}
