# Original User Request

## Initial Request — 2026-06-16T15:17:40Z

Build a premium, high-converting landing page for **EcoSplit AI**, a prop-tech and energy-tech startup. The page will feature deep dark mode aesthetics with neon accents, glassmorphism, and heavy abstract animations using Framer Motion, WebGL/Three.js, and AI-generated assets.

Working directory: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing
Integrity mode: benchmark

## Requirements

### R1. Tech Stack & Layout
Use Next.js, Vanilla CSS, and Framer Motion. Include sections for Hero, How It Works, About Us, and Contact Us.

### R2. Visual Aesthetics & Animation
Implement a deep dark mode design with vibrant neon accents and glassmorphic UI elements. Integrate WebGL/Three.js for complex 3D abstract backgrounds. Use Framer Motion for scroll-triggered, step-by-step animations, especially in the "How It Works" section to demo the product abstractly.

## Acceptance Criteria

### Technical & Layout
- [ ] `npm run build` succeeds without errors.
- [ ] The landing page contains distinct sections with IDs for Hero, How It Works, About Us, and Contact Us.
- [ ] Lighthouse accessibility and SEO scores are >= 90.

### Visual Aesthetics & Animation (Agent-as-Judge & Code Verification)
- [ ] The codebase contains active imports and usage of `framer-motion` and `three` (or `@react-three/fiber`).
- [ ] The "How It Works" section implements scroll-triggered step-by-step animations.
- [ ] The UI visually reflects a "deep dark mode with vibrant neon accents and glassmorphism" aesthetic.
- [ ] AI-generated abstract assets are incorporated into the design.

## Follow-up — 2026-06-16T15:23:35Z

The user has requested a change to the requirements. Please ensure that there is a seamless light/dark mode toggle included in the UI to maximize user preference. The primary aesthetic is still deep dark mode with neon accents, but the user must be able to switch to a clean light mode. Please incorporate this into your implementation immediately.

## Follow-up — 2026-06-16T15:48:23Z

The user has requested a change to the requirements. Please refine the structural implementation of the landing page: 1. In 'How It Works', add a 4th step for an 'AI Co-Pilot / Chatbot' feature. 2. The 'About Us' section should specifically be designed around a Founder Profile (Founder image placeholder, bio placeholder, and mission statement). 3. The 'Contact Us' section must include specific placeholders/icons for GitHub, LinkedIn, Email, and Phone number. Please ensure the UI accommodates these elements.

## Follow-up — 2026-06-16T15:51:57Z

The user has requested a change to the requirements. Please add one more section to the landing page UI: A 'Pricing' section. This should feature glassmorphic pricing cards that fit the deep dark mode aesthetic with glowing neon borders. It should have at least two tiers (e.g., Free Core and AI Premium). Please implement this alongside the other sections.

## Follow-up — 2026-06-17T06:38:15Z

Build a premium, high-converting landing page for **EcoSplit AI**, a prop-tech and energy-tech startup. The page will feature deep dark mode aesthetics with neon accents, glassmorphism, and heavy abstract animations using Framer Motion, WebGL/Three.js, and AI-generated assets.

Working directory: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing
Integrity mode: benchmark

## Requirements

### R1. Tech Stack & Layout
Use Next.js, Vanilla CSS, and Framer Motion. Include sections for Hero, How It Works (with 4 steps including an AI Co-Pilot), Pricing (with glassmorphic tiers), About Us (focused on a Founder Profile with bio/image placeholders), and Contact Us (with placeholders for GitHub, LinkedIn, Email, Phone).

### R2. Visual Aesthetics & Animation
Implement a deep dark mode design with vibrant neon accents and glassmorphic UI elements, and include a seamless light/dark mode toggle to maximize user preference. Integrate WebGL/Three.js for complex 3D abstract backgrounds. Use Framer Motion for scroll-triggered, step-by-step animations.

### R3. Project Resumption
You are resuming an existing workspace. There is already a `PROJECT.md`, `TEST_INFRA.md`, E2E tests, and some initial React/Three.js code. Do not overwrite the existing architectural setup; read the existing progress and continue building the UI from where the previous team left off.

## Acceptance Criteria

### Technical & Layout
- [ ] `npm run build` succeeds without errors.
- [ ] The landing page contains distinct sections with IDs for Hero, How It Works, About Us, and Contact Us.
- [ ] Lighthouse accessibility and SEO scores are >= 90.

### Visual Aesthetics & Animation (Agent-as-Judge & Code Verification)
- [ ] The codebase contains active imports and usage of `framer-motion` and `three` (or `@react-three/fiber`).
- [ ] The "How It Works" section implements scroll-triggered step-by-step animations.
- [ ] The UI visually reflects a "deep dark mode with vibrant neon accents and glassmorphism" aesthetic.
- [ ] AI-generated abstract assets are incorporated into the design.
