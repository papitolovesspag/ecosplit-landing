"use client";

import React from "react";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import AboutUs from "@/components/AboutUs";
import Pricing from "@/components/Pricing";
import ContactUs from "@/components/ContactUs";

export default function Home() {
  return (
    <main className="main-content">
      <Hero />
      <HowItWorks />
      <AboutUs />
      <Pricing />
      <ContactUs />
    </main>
  );
}
