# BRIEFING — 2026-06-16T15:42:00Z

## Mission
Analyze ThreeJS background implementation and design seamless light/dark mode toggle support matching E2E requirements.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Read-only investigator
- Working directory: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/explorer_m1_threejs_replace
- Original parent: f02cb98d-02be-40ca-acf5-8161a3095383
- Milestone: Milestone 1 - ThreeJS Background

## 🔒 Key Constraints
- Read-only investigation — do NOT implement / modify project source code
- WebGL background must adjust for light/dark mode (changing colors/opacities dynamically)
- Canvas must have exact ID `canvas#webgl-background` (E2E contract)
- Animation must react to theme toggle control `button#theme-toggle` state changes

## Current Parent
- Conversation ID: f02cb98d-02be-40ca-acf5-8161a3095383
- Updated: 2026-06-16T15:42:00Z

## Investigation State
- **Explored paths**:
  - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/explorer_m1_threejs_replace/analysis.md` (read previous work and updated it with theme toggle and canvas ID design)
  - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/PROJECT.md` (checked layout, files, and project requirements)
  - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/TEST_READY.md` (verified E2E test state)
  - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/e2e/tests/theme.spec.js` (inspected how theme is toggled and verified in tests)
  - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/e2e/tests/hero.spec.js` (checked for canvas ID assertion and mouse interaction verification)
  - `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/e2e/tests/cross-feature.spec.js` (checked for scroll and canvas interaction verification)
- **Key findings**:
  - E2E tests expect the canvas to have the ID `webgl-background`.
  - The E2E tests toggle the theme by clicking `header button#theme-toggle` or `header .theme-toggle-btn`. This modifies `document.documentElement`'s `data-theme` attribute (e.g., setting it to `light`) or checks for the `light`/`dark` class.
  - Adding a `MutationObserver` inside the `WebGLManager` class is the most performant, decoupled way to observe changes to `document.documentElement`'s theme classes/attributes.
  - Using a unified blending mode (`THREE.NormalBlending`) with customized shaders (lerping color, opacity, and size uniforms) prevents GPU pipeline stalls during runtime theme switches, optimizing frame rate.
- **Unexplored areas**:
  - The actual Next.js implementation has not started yet (as of Greenfield status), so visual verification on a live page will happen in Milestone 2.

## Key Decisions Made
- Recommended using `MutationObserver` on `document.documentElement` inside `WebGLManager` to achieve self-contained theme state synchronization without React rendering overhead.
- Selected unified `THREE.NormalBlending` for both dark and light themes, dynamically adjusting vertex size scale and fragment shader opacity/glow coefficients to guarantee smooth transitions without dynamic shader state recompiles.
- Formulated the exact canvas attribute `id="webgl-background"` matching Playwright E2E expectations.

## Artifact Index
- c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/explorer_m1_threejs_replace/analysis.md — Theme-aware Three.js design documentation.
- c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/explorer_m1_threejs_replace/handoff.md — Final handoff report containing the 5-component structure.
