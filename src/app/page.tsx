"use client";

import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import Architecture from "@/components/Architecture";
import HowItWorks from "@/components/HowItWorks";
import ApiShowcase from "@/components/ApiShowcase";
import Pricing from "@/components/Pricing";
import AboutUs from "@/components/AboutUs";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";
import LaunchConsoleModal from "@/components/LaunchConsoleModal";

export default function Home() {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  useEffect(() => {
    const handleOpenConsole = () => setIsConsoleOpen(true);
    window.addEventListener("open-launch-console", handleOpenConsole);
    return () => window.removeEventListener("open-launch-console", handleOpenConsole);
  }, []);

  return (
    <main className="main-content">
      <Hero onOpenConsole={() => setIsConsoleOpen(true)} />
      <Architecture />
      <HowItWorks />
      <ApiShowcase onOpenConsole={() => setIsConsoleOpen(true)} />
      <Pricing onOpenConsole={() => setIsConsoleOpen(true)} />
      <AboutUs />
      <ContactUs />
      <Footer />

      <LaunchConsoleModal 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
      />
    </main>
  );
}
