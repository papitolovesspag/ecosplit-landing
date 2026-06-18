# Analysis — Global Theme Configuration & Project Folder Structure

This document outlines the detailed strategy and code proposals for the global CSS theme, root layout structure, and directory organization for the EcoSplit AI landing page.

---

## 1. Global CSS Theme & Variables (`src/app/globals.css`)

Since this project utilizes **Vanilla CSS**, we will define theme configurations using CSS Custom Properties (Variables) on the `:root` level, combined with descriptive class definitions and responsive utilities.

### Theme Variables Proposal
```css
:root {
  /* Brand Theme Colors */
  --color-bg: #030712;                 /* Deep dark background (Slate-950 equivalent) */
  --color-bg-card: #090d16;            /* Secondary dark background for card bodies */
  --color-foreground: #f3f4f6;         /* Off-white for high-readability body text */
  --color-text-muted: #9ca3af;         /* Medium-gray for descriptions/subheadings */

  /* Neon Accents & Glow States */
  --color-neon-green: #10b981;         /* Primary neon green accent */
  --color-neon-green-glow: rgba(16, 185, 129, 0.15); /* 15% glow opacity */
  --color-neon-green-glow-strong: rgba(16, 185, 129, 0.35); /* 35% hover glow */
  
  --color-neon-cyan: #06b6d4;          /* Primary neon cyan accent */
  --color-neon-cyan-glow: rgba(6, 182, 212, 0.15);  /* 15% glow opacity */
  --color-neon-cyan-glow-strong: rgba(6, 182, 212, 0.35);  /* 35% hover glow */

  /* Glassmorphism Configuration */
  --glass-bg: rgba(11, 15, 25, 0.45);  /* Semi-transparent dark overlay */
  --glass-border: rgba(255, 255, 255, 0.08); /* Transparent boundary edge */
  --glass-border-hover: rgba(255, 255, 255, 0.16); /* Highlighted border on hover */
  --glass-blur: 16px;                  /* Backdrop blur filter strength */

  /* Layout Constants */
  --max-width-content: 1200px;
  --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Global Base Styles
```css
/* CSS Reset & Defaults */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background-color: var(--color-bg);
  color: var(--color-foreground);
  font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
  min-height: 100vh;
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Typography Defaults */
h1, h2, h3, h4, h5, h6 {
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

p {
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Custom Text Gradient Class */
.text-gradient {
  background: linear-gradient(135deg, var(--color-neon-green) 0%, var(--color-neon-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glassmorphic & Neon Accent Utilities
```css
/* Reusable Glass Panel Class */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.glass-panel:hover {
  border-color: var(--glass-border-hover);
  box-shadow: 0 8px 40px 0 rgba(0, 0, 0, 0.5);
}

/* Neon Glow Utilities */
.neon-glow-green {
  box-shadow: 0 0 25px var(--color-neon-green-glow);
}

.neon-glow-cyan {
  box-shadow: 0 0 25px var(--color-neon-cyan-glow);
}

/* Glass Cards with Neon Borders */
.glass-card-neon-green {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.glass-card-neon-green:hover {
  border-color: var(--color-neon-green);
  box-shadow: 0 0 25px var(--color-neon-green-glow), 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}

.glass-card-neon-cyan {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.glass-card-neon-cyan:hover {
  border-color: var(--color-neon-cyan);
  box-shadow: 0 0 25px var(--color-neon-cyan-glow), 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}

/* Interactive Neon Buttons */
.btn-neon-green {
  background: transparent;
  color: var(--color-neon-green);
  border: 1px solid var(--color-neon-green);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background var(--transition-normal), box-shadow var(--transition-normal), color var(--transition-normal);
  box-shadow: 0 0 10px var(--color-neon-green-glow);
}

.btn-neon-green:hover {
  background: var(--color-neon-green);
  color: var(--color-bg);
  box-shadow: 0 0 20px var(--color-neon-green-glow-strong);
}

.btn-neon-cyan {
  background: transparent;
  color: var(--color-neon-cyan);
  border: 1px solid var(--color-neon-cyan);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background var(--transition-normal), box-shadow var(--transition-normal), color var(--transition-normal);
  box-shadow: 0 0 10px var(--color-neon-cyan-glow);
}

.btn-neon-cyan:hover {
  background: var(--color-neon-cyan);
  color: var(--color-bg);
  box-shadow: 0 0 20px var(--color-neon-cyan-glow-strong);
}

/* Background Ambient Orbs (Fixed behind pages) */
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 1;
  opacity: 0.25;
}

.orb-green {
  background: radial-gradient(circle, var(--color-neon-green) 0%, transparent 70%);
  width: 45vw;
  height: 45vw;
}

.orb-cyan {
  background: radial-gradient(circle, var(--color-neon-cyan) 0%, transparent 70%);
  width: 50vw;
  height: 50vw;
}
```

---

## 2. Global Layout Structure (`src/app/layout.tsx`)

The root layout initializes font assets using `next/font/google` and organizes the baseline HTML document structure.

### Layout File Proposal
```tsx
import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import WebGLBackground from '@/components/WebGLBackground';

// Font definition (Primary font)
const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans', // Injected into globals.css
});

// Monospace accent font
const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono', // Injected into globals.css
});

export const metadata: Metadata = {
  title: 'EcoSplit AI — Premium Intelligent Energy Management',
  description: 'Unleash next-generation split energy-saving technology driven by real-time AI analytics and high-performance WebGL visualization.',
  keywords: ['EcoSplit', 'AI Energy Savings', 'Intelligent Split System', 'WebGL Energy Tracking', 'Next.js Dark Mode'],
  viewport: 'width=device-width, initial-scale=1.0',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="antialiased min-h-screen bg-[#030712] text-gray-100 overflow-x-hidden relative">
        {/* Fixed Background Three.js Layer rendering behind content */}
        <WebGLBackground />
        
        {/* Page contents wrapping sections (z-index overlays canvas) */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
```

---

## 3. Directory Layout & Organization

To keep development structured and maintain layout-independent styles, we propose a modular architecture using Next.js App Router conventions:

```
├── public/
│   └── assets/                  # AI-generated content and brand graphics
│       ├── logo.svg             # Gradient vector logo
│       ├── hero-illustration.png# AI-generated energy splitting process visualizer
│       ├── step-data.webp       # How-it-works visual (Step 1)
│       ├── step-analytics.webp  # How-it-works visual (Step 2)
│       ├── step-saving.webp     # How-it-works visual (Step 3)
│       └── team-member-1.webp   # Team avatar portrait
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Global document envelope
│   │   ├── page.tsx             # Aggregates components (Hero, HowItWorks, About, Contact)
│   │   └── globals.css          # Core theme config, variables, global styles
│   ├── components/
│   │   ├── Hero.tsx             # Interactive Hero Section component
│   │   ├── Hero.module.css      # Isolated Vanilla CSS module for Hero layout
│   │   ├── HowItWorks.tsx       # Interactive Framer Motion timeline scrolling component
│   │   ├── HowItWorks.module.css# Scroll timeline layout rules
│   │   ├── AboutUs.tsx          # Team profile component
│   │   ├── AboutUs.module.css   # AboutUs flex/grid layout rules
│   │   ├── ContactUs.tsx        # React Form Validation component
│   │   ├── ContactUs.module.css # Form controls, focus/validation styles
│   │   ├── WebGLBackground.tsx  # Three.js viewport canvas component
│   │   └── ui/                  # Reusable low-level UI primitives
│   │       ├── Button.tsx
│   │       ├── Button.module.css
│   │       ├── Input.tsx
│   │       ├── Input.module.css
│   │       ├── GlassCard.tsx
│   │       └── GlassCard.module.css
│   └── hooks/
│       └── useWebGL.ts          # Custom hook for WebGL setup/performance monitoring
```

### Core Directory Breakdown
1. **`src/components/ui/`**: Low-level, stateless, theme-compliant UI primitives. Each component contains its own `.tsx` file and matching `.module.css` stylesheet for isolated sizing/padding rules while using `--color-*` variables declared in `globals.css`.
2. **`src/hooks/`**: Shared custom Hooks (e.g. `useWebGL` for managing the Three.js viewport cycle, resize events, and clean resource disposal).
3. **`public/assets/`**: Central storage for all static and AI-generated image resources. Optimized visual extensions (such as `.webp` or `.svg`) should be enforced for lightning-fast site loads.
