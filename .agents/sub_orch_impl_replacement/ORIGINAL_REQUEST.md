# Original User Request

## 2026-06-17T06:50:42Z

You are the Implementation Track Orchestrator for the EcoSplit AI landing page.
Your working directory is: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/sub_orch_impl_replacement
Your role is: orchestrator, user_liaison, human_reporter, successor
Your parent is: bddea34f-2df0-4b52-ae22-10ed5922ccaa (conversation ID: a6b0877b-f228-4f64-ae3a-df535e9b6e18)

Your mission is to manage and coordinate the implementation of the EcoSplit AI landing page and verify it.
You are replacing the previous implementation sub-orchestrator which stalled on Milestone 1.

1. Read c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/ORIGINAL_REQUEST.md and c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/PROJECT.md.
2. Initialize BRIEFING.md and progress.md in your working directory.
3. Review the current code at `src/` (the page layout `src/app/page.tsx`, `src/components/`, etc.) and global styles at `src/app/globals.css`.
4. Note that NextJS setup, WebGL background, and standard UI sections (Hero, How It Works, About Us, Pricing, Contact Us) appear to be already implemented. However, they must be rigorously verified against the 63 E2E test cases in `e2e/tests/` using the loop:
   - For any incomplete, buggy, or failing implementation aspects, spawn a Worker to make changes. Remember to include the mandatory integrity warning.
   - Spawn Reviewers to check correctness, visual aesthetics, dark/light theme toggle, and design.
   - Spawn Challengers to verify compliance with DOM selectors and performance.
   - Spawn a Forensic Auditor (teamwork_preview_auditor) to perform integrity checks.
   - Check the Gate: all must pass (build/test, reviewer approvals, clean auditor report).
5. Ensure that the React application code matches the final selectors contract exactly:
   - Hero Section wrapper: `section#hero`
   - WebGL Background canvas: `canvas#webgl-background`
   - How It Works Section wrapper: `section#how-it-works` (must have scroll height container/sticky behavior, 4 interactive animation steps: 0, 1, 2, 3, and 4 representing 'AI Co-Pilot / Chatbot')
   - About Us Section wrapper: `section#about-us` (specifically designed around a Founder Profile: founder image, founder bio, company mission statement)
   - Pricing Section wrapper: `section#pricing` (must contain pricing cards with class `.pricing-card`, representing 'Free Core' and 'AI Premium' tiers with glowing neon borders, monthly/yearly toggle interval updating prices)
   - Contact Us Section wrapper: `section#contact-us` (social/contact placeholders and icons for GitHub, LinkedIn, Email, Phone, and form `form#contact-form` with validation and neon-red error borders on invalid focus)
   - Navbar / Header Theme Toggle: `button#theme-toggle` (toggles the `data-theme` attribute to 'light' or 'dark' on `<html>` or `<body>` element, syncing CSS variables and WebGL background colors)
6. Once the implementation milestones are complete, run the full E2E test suite in `e2e/tests/` via a worker or challenger to make sure 100% of the 63 tests pass.
7. Perform adversarial coverage hardening (Tier 5) using Challengers and Reviewers.
8. Report final completion and write a soft or hard handoff to your parent conversation ID.
