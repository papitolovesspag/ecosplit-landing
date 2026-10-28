"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiX, FiKey, FiCopy, FiCheck, FiArrowRight, FiCpu, FiServer, FiShield } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface LaunchConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LaunchConsoleModal({ isOpen, onClose }: LaunchConsoleModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [hardware, setHardware] = useState("Tesla Powerwall");
  
  // Provisioning State
  const [isProvisioned, setIsProvisioned] = useState(false);
  const [apiKey, setApiKey] = useState("eco_live_7c992a01f9e83bd");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;

      if (modalRef.current) {
        modalRef.current.focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (e.key === "Tab") {
          if (!modalRef.current) return;

          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
          );

          if (focusables.length === 0) return;

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              lastEl.focus();
              e.preventDefault();
            }
          } else {
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
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const randomSuffix = Math.random().toString(36).substring(2, 12);
    setApiKey(`eco_live_${randomSuffix}`);
    setIsProvisioned(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchSimulator = () => {
    onClose();
    router.push("/demo");
  };

  return (
    <div 
      className="checkout-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="console-modal-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="checkout-modal glass-card launch-console-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px", width: "95%", outline: "none", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div className="modal-title-wrap">
            <div className="badge-pill sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <FiKey /> EcoSplit Cloud Console
            </div>
            <h3 id="console-modal-title" style={{ margin: 0, fontSize: '1.35rem' }}>
              Instant Cloud Telemetry Provisioning
            </h3>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Close modal"
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.25rem' }}
          >
            <FiX />
          </button>
        </div>

        <p className="modal-description" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Zero-touch self-serve onboarding. Configure your virtual environment or hardware gateway to receive real-time API keys and access the live optimization simulator.
        </p>

        {!isProvisioned ? (
          <form onSubmit={handleGenerateKey} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label htmlFor="modal-email" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500 }}>
                Work Email Address
              </label>
              <input 
                id="modal-email" 
                type="email" 
                required 
                placeholder="developer@gridutility.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--foreground)' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-org" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500 }}>
                Project or Organization Name
              </label>
              <input 
                id="modal-org" 
                type="text" 
                required 
                placeholder="Apex Clean Energy Fleet" 
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--foreground)' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.85rem', fontWeight: 500 }}>
                Deployment Environment
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEnvironment("sandbox")}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: environment === "sandbox" ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                    background: environment === "sandbox" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.2)',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiServer /> Developer Sandbox
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10,000 monthly calls, virtual simulated grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEnvironment("production")}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: environment === "production" ? '2px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
                    background: environment === "production" ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.2)',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiShield /> Production Fleet
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sub-120ms SLA, dedicated cloud telemetry</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.85rem', fontWeight: 500 }}>
                Select Hardware or Inverter Gateway
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  "Tesla Powerwall",
                  "Enphase IQ Gateway",
                  "SolarEdge Cloud",
                  "OpenADR 2.0b VEN",
                  "Virtual Simulator"
                ].map((hw) => (
                  <button
                    key={hw}
                    type="button"
                    onClick={() => setHardware(hw)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      border: hardware === hw ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                      background: hardware === hw ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: hardware === hw ? '#000' : 'var(--foreground)',
                      fontWeight: hardware === hw ? 600 : 400
                    }}
                  >
                    {hw}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-cta btn-primary"
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              Provision Credentials &amp; Key <FiArrowRight />
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                <FiCheck /> Credentials Successfully Provisioned!
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Target: <strong>{hardware}</strong> &bull; Environment: <strong>{environment.toUpperCase()}</strong> &bull; Org: <strong>{orgName || "Default Org"}</strong>
              </p>
            </div>

            <div className="api-key-box" style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FiKey /> Live API Token
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={apiKey} 
                  style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: 'var(--foreground)', fontFamily: 'monospace', fontSize: '0.85rem' }} 
                />
                <button 
                  type="button" 
                  onClick={handleCopy} 
                  className="btn-cta btn-secondary" 
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {copied ? <FiCheck className="font-green" /> : <FiCopy />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              <code>curl -X POST https://api.ecosplitai.com/v1/telemetry/split \<br/>
              &nbsp;&nbsp;-H &quot;Authorization: Bearer {apiKey}&quot;
              </code>
            </div>

            <div className="checkout-actions" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn-cta btn-primary" 
                onClick={handleLaunchSimulator}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <FiCpu /> Open Live Simulator Console (/demo) <FiArrowRight />
              </button>
              <button 
                type="button" 
                className="btn-cta btn-secondary" 
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
