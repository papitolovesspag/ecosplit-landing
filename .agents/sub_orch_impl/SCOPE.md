# Scope: Implementation Track

## Architecture
- EcoSplit AI landing page is built with Next.js (App Router), Vanilla CSS, Framer Motion, and WebGL (Three.js).
- Global theme and custom variables in globals.css.
- Three.js background reacting to scroll/mouse events.
- Hero, How It Works, About Us, and Contact Us sections.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | Project Setup & WebGL Background | Initialize Next.js, add dependencies, configure Vanilla CSS theme variables, and implement Three.js/WebGL background. | None | IN_PROGRESS | f02cb98d-02be-40ca-acf5-8161a3095383 |
| 2 | Hero Section UI & Framer Motion | Hero section layout, premium dark/neon accents, glassmorphic cards, active nav, Framer Motion transitions. | M1 | PLANNED | |
| 3 | How It Works Scroll Animation | Scroll-triggered step-by-step product demo animation with Framer Motion. | M2 | PLANNED | |
| 4 | About, Pricing, & Contact Sections | About Us, Pricing, and Contact Us sections, including pricing cards, founder profile, contact form, and social links. | M3 | PLANNED | |
| 5 | E2E Test Pass & Adversarial Hardening | Pass 100% of E2E tests (Tiers 1-4) and adversarial coverage hardening (Tier 5). | M1, M2, M3, M4 | PLANNED | |

## Interface Contracts
### Contractual IDs and Elements
- Hero Section: `section#hero`
- WebGL Canvas: `canvas#webgl-background`
- How It Works Section: `section#how-it-works`
- About Us Section: `section#about-us`
- Pricing Section: `section#pricing`
- Contact Us Section: `section#contact-us`
- Contact Form: `form#contact-form` (fields for name, email, message with HTML5 validations and neon-red active error borders on highlight)
- Theme Toggle: `button#theme-toggle` (placed in the header/navbar, toggles state via custom React state and updates `data-theme="light"` or `data-theme="dark"` attribute on the `<html>` or `<body>` tag)

### WebGLBackground ↔ Page Components
- WebGLBackground is a fixed-position background rendering under all other content via `canvas#webgl-background`.
- Adapts speed, density, and color palette based on page scroll, mouse coordinates, and light/dark theme state.

### Form Validation
- Contact form `form#contact-form` uses React states and standard HTML5 input validations. Active inputs display a neon cyan or green border, while invalid fields with error states transition to neon-red active borders.

### Abstract Scroll Controller
- HowItWorks (`section#how-it-works`) sticky container triggers index updates (0 to 4) via Framer Motion's scroll hook with a height of `400vh`. Step 4 corresponds to the 'AI Co-Pilot / Chatbot' feature.

### Section Structure Specifications
- Hero Section: `section#hero`
- How It Works Section: `section#how-it-works` (scroll height 400vh, 4 animation steps: 1, 2, 3, and 4 'AI Co-Pilot / Chatbot')
- About Us Section: `section#about-us` (Founder Profile design: founder image placeholder, founder bio placeholder, company mission statement)
- Pricing Section: `section#pricing` (glassmorphic pricing cards using class `.pricing-card`, Free Core and AI Premium tiers with glowing neon borders)
- Contact Us Section: `section#contact-us` (Contact Form `form#contact-form`, placeholders/icons for GitHub, LinkedIn, Email, and Phone number)
