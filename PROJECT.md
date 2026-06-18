# Project: EcoSplit AI Landing Page

## Architecture
EcoSplit AI is a landing page built with Next.js (App Router), Vanilla CSS, Framer Motion, and WebGL (Three.js).
The architecture consists of:
- **WebGL/Three.js Background**: A background canvas overlaying the page with fluid 3D abstract neon particles, reacting to scroll/mouse movements. In light mode, it transitions to a clean, bright, subtle particle representation.
- **Hero Section**: Premium deep dark mode presentation of EcoSplit AI's value proposition with glassmorphic cards and vibrant neon borders, seamlessly adapting to a clean, light-mode palette when toggled.
- **How It Works Section**: A scroll-controlled component using Framer Motion's `useScroll` and `useTransform` to drive step-by-step animation states, demonstrating the split energy-saving logic across 4 steps, concluding with the AI Co-Pilot / Chatbot feature.
- **About Us Section**: Highlighting the company's background and mission statement, structured specifically around a Founder Profile featuring a founder image placeholder and bio.
- **Contact Us Section**: A premium responsive contact form with input validation and feedback animations, accompanied by contact details and placeholders/icons for GitHub, LinkedIn, Email, and Phone number.
- **Global Theme & CSS Variables**: Defined in `globals.css` with dark/light themes. The dark theme has a deep dark background (`#030712`), neon green (`#10b981`), and neon cyan (`#06b6d4`). The light theme translates these to clean, bright counterparts with dark text, while preserving the premium accents. Includes a theme toggle component.

## Code Layout
```
├── .agents/
├── public/
│   └── assets/           # AI-generated assets, logos, and images
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Global layout, fonts, and metadata
│   │   ├── page.tsx      # Main landing page assembling sections
│   │   └── globals.css   # Theme variables, custom utility styles
│   ├── components/
│   │   ├── WebGLBackground.tsx  # Three.js canvas setup
│   │   ├── Hero.tsx             # Hero section
│   │   ├── HowItWorks.tsx       # Interactive step-by-step demo
│   │   ├── AboutUs.tsx          # About Us cards
│   │   ├── ContactUs.tsx        # Contact Us form
│   │   └── ui/                  # Reusable UI primitives (buttons, inputs, glass cards)
│   └── hooks/
│       └── useWebGL.ts          # Custom hook for WebGL initialization/events
├── e2e/                  # E2E Test suite
│   ├── tests/            # Test cases (Tiers 1-4)
│   └── runner.js         # Test runner script
├── package.json
└── README.md
```

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | E2E Testing Track | Define feature inventory and build E2E test suite (Tiers 1-4) in `e2e/`, publishing `TEST_READY.md`. | None | DONE | 4b498897-2100-4e20-b3f5-597eab80efd8 |
| 2 | Project Setup & WebGL Base | Initialize Next.js, add dependencies, configure Vanilla CSS theme variables for dark/light themes, implement theme toggle state, and implement Three.js/WebGL background. | None | DONE | 0a23a647-bf9d-44b4-ac82-3513082dc32a |
| 3 | Hero Section & UI Kit | Build the Hero section, navbar (with light/dark toggle), and reusable glassmorphism components with neon accents. | M2 | DONE | 0a23a647-bf9d-44b4-ac82-3513082dc32a |
| 4 | How It Works Animation | Implement the scroll-triggered step-by-step product demo using Framer Motion & R4 fix. | M3 | DONE | 0a23a647-bf9d-44b4-ac82-3513082dc32a |
| 5 | About & Contact Sections | Build the About Us and Contact Us sections, including responsive design and form validation. | M4 | DONE | 0a23a647-bf9d-44b4-ac82-3513082dc32a |
| 6 | Integration & Verification | Pass 100% of E2E tests (Tiers 1-4) and verify with Forensic Auditor. | M1, M5 | DONE | 094c3dfd-1f89-4907-bf69-4968d277e098 |

## Interface Contracts
### WebGLBackground ↔ Page Components
- WebGLBackground is a fixed-position background element rendering under all other content.
- It exposes events or reactive controls (e.g., custom events or window scroll listeners) to adjust animation speed or density based on the active section.

### Light/Dark Mode Theme Provider
- Theme state is managed at the root level (layout or context provider) and toggleable from the navbar.
- Toggling theme updates the `data-theme` attribute on the `<html>` or `<body>` element (e.g. `data-theme="light"` or `data-theme="dark"`).
- Global theme values (backgrounds, border gradients, text colors) are bound to CSS variables that respond reactively to this attribute.

### Form Validation
- Contact Form uses pure React states or standard HTML5 validation styled with custom CSS to provide premium error and success states.

### Abstract Scroll Controller
- HowItWorks component uses a container element with `position: sticky` and height (e.g. `400vh`) to trigger scroll scroll progress from `0` to `1` using Framer Motion, updating internal step index (`0` to `4`).
