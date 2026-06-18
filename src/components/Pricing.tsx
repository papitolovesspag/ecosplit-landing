"use client";

import React, { useState, useEffect, useRef } from "react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingCycle: "monthly" | "yearly";
}

function CheckoutModal({ isOpen, onClose, billingCycle }: CheckoutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 1. Cache the element that triggered the modal opening
      triggerElementRef.current = document.activeElement as HTMLElement;

      // 2. Focus the modal container
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // 3. Setup keydown listeners
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (e.key === "Tab") {
          if (!modalRef.current) return;

          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
          );

          if (focusables.length === 0) return;

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            // Shift + Tab: Wrap from first to last
            if (document.activeElement === firstEl) {
              lastEl.focus();
              e.preventDefault();
            }
          } else {
            // Tab: Wrap from last to first
            if (document.activeElement === lastEl) {
              firstEl.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        // 4. Restore focus on close
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="checkout-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="checkout-modal glass-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ outline: "none" }}
      >
        <h3 id="modal-title">Confirm Upgrade</h3>
        <p>You selected the <strong>AI Premium</strong> plan ({billingCycle === "monthly" ? "$29/mo" : "$19/mo, billed annually"}).</p>
        <div className="checkout-actions">
          <button className="btn-cta btn-primary" onClick={() => {
            alert("Thank you for your purchase!");
            onClose();
          }}>
            Complete Checkout
          </button>
          <button className="btn-cta btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const toggleBilling = () => {
    setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };

  return (
    <section id="pricing" className="section-pricing">
      <div className="container">
        <div className="pricing-header">
          <h2>Transparent, Value-Driven Pricing</h2>
          <p>Choose the plan that fits your energy consumption needs. De-risk your bill today.</p>
          
          <div className="billing-toggle-container">
            <span className={billingCycle === "monthly" ? "active-cycle" : ""}>Monthly</span>
            <button 
              id="billing-toggle" 
              role="switch" 
              aria-checked={billingCycle === "yearly"}
              onClick={toggleBilling}
              className="billing-toggle-btn"
              aria-label="Toggle billing interval"
            >
              <span className={`toggle-slider ${billingCycle === "yearly" ? "yearly" : "monthly"}`}></span>
            </button>
            <span className={billingCycle === "yearly" ? "active-cycle" : ""}>Yearly (Save 35%)</span>
          </div>
        </div>
        
        <div className="pricing-grid">
          <div className="pricing-card glass-card">
            <h3>Free Core</h3>
            <div className="price">
              $0<span>/{billingCycle === "monthly" ? "mo" : "yr"}</span>
            </div>
            <p className="price-desc">Perfect for small apartments or single smart-meter households.</p>
            <ul className="price-features">
              <li>Real-time load split tracking</li>
              <li>Email reports & summaries</li>
              <li>Standard community support</li>
            </ul>
            <a href="#contact-us" className="btn-cta btn-secondary">Get Started</a>
          </div>
          
          <div className="pricing-card glass-card pricing-featured">
            <div className="badge">Most Popular</div>
            <h3>AI Premium</h3>
            <div className="price">
              {billingCycle === "monthly" ? "$29" : "$19"}
              <span>/mo</span>
            </div>
            <p className="price-desc">Optimized for medium to large family homes with high energy loads.</p>
            <ul className="price-features">
              <li>Automated grid-balancing integration</li>
              <li>Advanced AI load splitting</li>
              <li>AI Co-Pilot / Chatbot access</li>
              <li>Priority support & SMS alerts</li>
            </ul>
            <button className="btn-cta btn-primary" onClick={() => setShowCheckoutModal(true)}>
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={showCheckoutModal} 
        onClose={() => setShowCheckoutModal(false)} 
        billingCycle={billingCycle} 
      />
    </section>
  );
}
