# Analysis: Next.js Setup Strategy (Vanilla CSS & WebGL Integration)

## 1. Project Initialization Strategy

### Exact Command
To initialize the project at the root (`c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing`), the following command must be run using npm (using `.cmd` to bypass PowerShell script execution restrictions on Windows):

```powershell
npx.cmd create-next-app@latest . --typescript --eslint --src-dir --app --import-alias "@/*" --no-tailwind --use-npm
```

### Prompt Interactive Handling
When the prompt asks:
> *"The directory c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing contains files that could conflict: ... Would you like to proceed?"*
Select **Yes** to allow `create-next-app` to merge files without deleting existing coordination files like `PROJECT.md` or `.agents/`.

---

## 2. Dependencies & Typings

To implement Milestone 2 (WebGL canvas background) and Milestone 4 (scroll-controlled Framer Motion animation), the following dependencies must be installed:

### Installation Commands
```powershell
npm.cmd install framer-motion three react-icons --legacy-peer-deps
npm.cmd install -D @types/three --legacy-peer-deps
```

*Note: The `--legacy-peer-deps` flag is recommended because Next.js 15 depends on React 19, which might prompt strict peer dependency warnings on older sub-dependencies.*

---

## 3. Global Configurations

### tsconfig.json
Next.js will generate a standard typescript configuration. To ensure clean paths and strict safety, verify or merge the following configurations in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### eslint.config.mjs
Next.js 15 uses flat config file `eslint.config.mjs` by default. It should look like this:

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("next/typescript"),
];

export default eslintConfig;
```

### next.config.ts
For Next.js 15, the configuration uses TypeScript. Since we are using Vanilla CSS and CSS modules, next.config.ts can remain simple and minimal:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // WebGL can be dynamically imported (ssr: false), eliminating the need for complex Webpack transpiles.
};

export default nextConfig;
```

---

## 4. Layout & Styling Architecture

### Root Layout (`src/app/layout.tsx`)
In Next.js App Router, the global layout should load Google Web Fonts (such as Geist or Space Grotesk) and inject them into custom CSS variables, import the global CSS stylesheet, and render the page viewport.

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoSplit AI | Premium Smart Energy Distribution",
  description: "AI-driven energy saving optimization with 3D fluid particles and glassmorphic telemetry control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### Global Variables and Theme (`src/app/globals.css`)
To satisfy the Vanilla CSS requirement and project visual guidelines (deep dark mode with neon accents and glassmorphism), `globals.css` must contain:

```css
:root {
  /* Color Palette */
  --background: #030712; /* Deep dark slate-black */
  --foreground: #f3f4f6; /* Soft light-gray text */
  
  /* Brand/Accent Colors */
  --neon-green: #10b981;
  --neon-cyan: #06b6d4;
  
  /* Glow Effects */
  --neon-green-glow: 0 0 10px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2);
  --neon-cyan-glow: 0 0 10px rgba(6, 182, 212, 0.4), 0 0 20px rgba(6, 182, 212, 0.2);
  
  /* Glassmorphism Details */
  --glass-bg: rgba(17, 24, 39, 0.7);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-hover: rgba(6, 182, 212, 0.3);
  
  /* Layout Properties */
  --font-sans: var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  color: var(--foreground);
  background-color: var(--background);
  font-family: var(--font-sans);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  scroll-behavior: smooth;
}

/* Glassmorphism utility classes */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.glass-panel:hover {
  border-color: var(--glass-border-hover);
  box-shadow: var(--neon-cyan-glow);
}

.text-neon-cyan {
  color: var(--neon-cyan);
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
}

.text-neon-green {
  color: var(--neon-green);
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}
```

---

## 5. WebGL Component Integration Strategy

Because Three.js relies on document object model interfaces (such as `window` and `document.createElement('canvas')`), rendering it during Server-Side Rendering (SSR) will trigger reference exceptions.

### Client-Side Lazy Mounting
Components requiring Three.js (e.g. `WebGLBackground.tsx`) must be loaded dynamically inside pages:

```typescript
// src/app/page.tsx
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import AboutUs from '@/components/AboutUs';
import ContactUs from '@/components/ContactUs';

// Dynamic Import without SSR for WebGL Component
const WebGLBackground = dynamic(
  () => import('@/components/WebGLBackground'),
  { ssr: false }
);

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh' }}>
      {/* WebGL background floats underneath layout elements */}
      <WebGLBackground />
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
        <HowItWorks />
        <AboutUs />
        <ContactUs />
      </div>
    </main>
  );
}
```

---

## 6. CSS Module Component Naming Convention
To enforce Vanilla CSS compliance and clean component boundaries:
1. For every component `src/components/MyComponent.tsx`, there should be a matching CSS module file `src/components/MyComponent.module.css`.
2. Example usage in `src/components/Hero.tsx`:
   ```typescript
   import styles from './Hero.module.css';
   
   export default function Hero() {
     return (
       <section className={styles.heroContainer}>
         <h1 className={styles.heroTitle}>EcoSplit AI</h1>
       </section>
     );
   }
   ```
