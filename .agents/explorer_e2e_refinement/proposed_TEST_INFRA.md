# E2E Test Playbook & Infrastructure Specification

This document details the End-to-End (E2E) test infrastructure for the EcoSplit AI landing page.

---

## 1. Test Architecture Overview

EcoSplit AI's E2E test suite uses Playwright to validate component presence, user interactions, responsive animations, and end-to-end customer journeys. 

### Core Selectors (from `PROJECT.md`)
- Hero Section: `section#hero`
- WebGL Background: `canvas#webgl-background`
- How It Works Section: `section#how-it-works`
- About Us Section: `section#about-us`
- Contact Us Section: `section#contact-us`
- Contact Form: `form#contact-form`

---

## 2. Test Tiers

The test suite is structured into 4 distinct tiers:
- **Tier 1**: Basic component render and element presence in DOM.
- **Tier 2**: Element-level interactive behaviors, animations, hover states, and input validation.
- **Tier 3**: Cross-feature interactions, shared state changes, scroll-linked WebGL adjustments.
- **Tier 4**: Complete end-to-end user journeys and accessibility verification.

---

## 3. The 53 E2E Test Cases

### Hero Section Tests (`e2e/tests/hero.spec.js`)

#### Tier 1: Render and Visual Presence
1. **Hero Wrapper Presence**: `section#hero` must exist in the page.
2. **WebGL Background Canvas Presence**: `canvas#webgl-background` must exist in the layout.
3. **Core Headline Render**: The main title containing "EcoSplit AI" or the primary value proposition is rendered.
4. **CTA Buttons Presence**: Call-to-action buttons (e.g. "Get Started", "Explore Demo") must be rendered.
5. **Glassmorphic Cards Presence**: Neon-bordered cards must exist inside the Hero container.

#### Tier 2: Interactive States & Behaviors
6. **CTA Button Hovers**: CTA buttons must change styles (neon glow/border highlights) on hover.
7. **Glassmorphic Card Hovers**: Cards must trigger glow transitions or accent shifts on hover.
8. **Navigation Links**: Header navigation links must be present and correctly configured (pointing to `#how-it-works`, `#about-us`, `#contact-us`).
9. **Smooth Scroll Action**: Clicking a navigation link must initiate smooth scrolling to the respective section.
10. **WebGL Mouse Interaction**: WebGL background mouse movement listener should initialize on load.

---

### How It Works Section Tests (`e2e/tests/how-it-works.spec.js`)

#### Tier 1: Render and Visual Presence
11. **How It Works Wrapper Presence**: `section#how-it-works` must exist in the page.
12. **Step-by-Step Container**: Interactive demo container must exist in the DOM.
13. **Step Indicators**: Step indicator elements (e.g. Step 0 to Step 4) must be visible.
14. **Explanatory Copy**: Energy-saving split logic descriptions and content must be rendered.
15. **Scroll Guidance Indicators**: Cues instructing the user to scroll to advance steps must be present.

#### Tier 2: Interactive States & Behaviors
16. **Sticky Container Height**: The outer scroll wrapper must have appropriate styling (e.g., sticky container with height `400vh` or similar) to handle scroll animations.
17. **Step Transition (0 to 1)**: Scrolling down the page must advance the active step state from Step 0 to Step 1.
18. **Step Transition (1 to 2)**: Scrolling further must update UI cards/graphs to reflect Step 2.
19. **Step Transition (2 to 3)**: Scrolling further must update UI components to reflect Step 3.
20. **Step Transition (3 to 4) & Reverse Scroll**: Scrolling to the end of the container must show Step 4 (AI Co-Pilot / Chatbot) and reverse scroll back to previous steps works.

---

### About Us Section Tests (`e2e/tests/about-us.spec.js`)

#### Tier 1: Render and Visual Presence
21. **About Us Wrapper Presence**: `section#about-us` must exist in the page.
22. **Founder Profile Container**: Founder Profile container must be rendered in the section.
23. **Founder Image & Bio Placeholders**: Founder image placeholder and founder bio placeholder must be present.
24. **Company Mission Statement**: Company mission statement must be visible in the section.
25. **Brand Logo / Assets**: Key visual assets must be successfully displayed.

#### Tier 2: Interactive States & Behaviors
26. **Founder Profile Card Hovers**: Hovering/focusing on Founder Profile card/container triggers neon green/cyan glow styles.
27. **Founder Social Media Links**: Social icons/links (e.g., LinkedIn, Twitter/X) must exist on the Founder Profile with correct hover styles.
28. **Content Expandable Elements**: Triggering any toggle/accordion in About Us expands/collapses details.
29. **Keyboard Tab Navigation**: Accessible elements within About Us must accept keyboard focus.
30. **WebGL Scroll Adjustment**: Scrolling into the About Us section modifies background particle velocity/density.

---

### Contact Us Section Tests (`e2e/tests/contact-us.spec.js`)

#### Tier 1: Render and Visual Presence
31. **Contact Us Wrapper Presence**: `section#contact-us` must exist in the page.
32. **Form Render**: `form#contact-form` must be present with Name, Email, and Message inputs.
33. **Input Labels and Placeholders**: Form controls must have valid accessibility labels and placeholder texts.
34. **Submit Button**: The submit button must be visible and enabled initially.
35. **Contact Placeholders & Icons**: Placeholders or icons for GitHub, LinkedIn, Email, and Phone number must be present.

#### Tier 2: Interactive States & Behaviors
36. **Blank Form Rejection**: Submitting a blank form must fail and show validation errors.
37. **Invalid Email Validation**: Entering an invalid email format must trigger an inline validation warning.
38. **Submission Success Feedback**: Submitting valid data must trigger a success message and submission animation.
39. **Invalid Inputs Highlighting**: Invalid inputs must be highlighted with neon red borders.
40. **Active Input Styling**: Active input fields must glow with neon green/cyan borders.

---

### Cross-Feature Integration Tests (`e2e/tests/cross-feature.spec.js`)

#### Tier 3: Core Integrations
41. **Header Scroll Styles**: Navigation header must change background/blur styling when scrolled away from the page top.
42. **Active Nav Link Tracking**: The navigation links must highlight dynamically matching the active section in view.
43. **WebGL Scroll Coupling**: Scroll velocity and scroll position must map to global WebGL shader attributes.
44. **Form Submit Coordination**: Form submission updates page-wide state or triggers a global layout feedback modal.

---

### End-to-End User Scenarios (`e2e/tests/scenarios.spec.js`)

#### Tier 4: Customer Journeys
45. **E2E Scenario 1: CTA-to-Demo Flow**: User lands on page, clicks the Hero CTA button, gets scrolled to the interactive steps, and completes the entire scroll demo (verifying Step 4).
46. **E2E Scenario 2: Founder Profile Discovery**: User lands on page, navigates to About Us, inspects Founder Profile (image, bio, mission), hovers/focuses links, and tests accessibility.
47. **E2E Scenario 3: Complete Lead Generation**: User lands on page, scrolls to Contact Us, enters valid query, submits form, and verifies confirmation response.
48. **E2E Scenario 4: Error Mitigation Loop**: User enters invalid email, attempts submission, observes error, fixes email field, submits successfully, and views success modal.
49. **E2E Scenario 5: Full Keyboard Accessibility Run**: User navigates the entire page from top to bottom using only keyboard `Tab` and `Enter` keys, verifying focus rings and interactive event triggers.

---

### Theme Toggle Tests (`e2e/tests/theme.spec.js`)

#### Tier 1: Feature Coverage
50. **Theme Toggle UI Presence**: Verify that a theme toggle control is present in the navigation/header and displays the correct active theme state/icon.

#### Tier 2: Boundary/Edge Cases
51. **Theme State Persistence**: Toggle the theme to Light Mode, reload the page, and verify that the theme state persists as Light Mode.

#### Tier 3: Cross-Feature Combinations
52. **Theme Toggle WebGL Background Sync**: Toggle the theme and verify that CSS variables and the WebGL background canvas configurations update to match the active theme.

#### Tier 4: Real-World Scenarios
53. **Light Mode Contrast/A11y Conformance**: Emulate light mode, check that the page layout transitions cleanly, and verify that text elements meet WCAG contrast ratio (>= 4.5:1) in Light Mode.

---

## 4. How to Execute Tests

The test runner can be launched with:
```bash
npm run test:e2e
```
Or directly:
```bash
node e2e/runner.js
```

### Greenfield Validation Mode
If the web server is offline (not running on port 3000) or Playwright has not been fully installed due to network restrictions, the runner operates in **Greenfield Validation Mode**.
In this mode, it:
1. Prints a structured checklist of all 53 test cases with `[FAIL]` status and explanation: `"Website not implemented / server offline"`.
2. Prints a summary of results (0/53 passed, 53/53 failed).
3. Exits with exit code `1`.
