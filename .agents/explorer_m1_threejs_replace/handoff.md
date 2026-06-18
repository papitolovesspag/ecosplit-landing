# Handoff Report — ThreeJS Background Explorer

This handoff report summarizes the read-only investigation and design findings for integrating the theme-aware WebGL background system into the EcoSplit AI landing page.

## 1. Observation

1. **E2E Selector Specifications**:
   - In `e2e/tests/hero.spec.js`, line 17:
     ```javascript
     const webglCanvas = page.locator('canvas#webgl-background');
     await expect(webglCanvas).toBeVisible();
     ```
   - In `e2e/tests/theme.spec.js`, line 63:
     ```javascript
     const canvas = page.locator('canvas#webgl-background');
     await expect(canvas).toBeVisible();
     ```
   - *Observation*: The E2E tests strictly require a canvas element matching the selector `canvas#webgl-background`. The previous design in `analysis.md` (copied to our folder) lacked this ID, only containing `className="webgl-background-canvas"`.

2. **Theme Switch Interactivity**:
   - In `e2e/tests/theme.spec.js`, lines 15-20:
     ```javascript
     const isDark = await themeToggle.evaluate((el) => {
       return el.getAttribute('aria-label')?.includes('light') || 
              el.querySelector('svg.icon-dark, .icon-moon') !== null ||
              document.documentElement.getAttribute('data-theme') === 'dark' ||
              document.documentElement.classList.contains('dark');
     });
     ```
   - In `e2e/tests/theme.spec.js`, line 34:
     ```javascript
     let currentTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || (document.documentElement.classList.contains('light') ? 'light' : ''));
     ```
   - *Observation*: The theme toggle interacts with `document.documentElement` by updating either the `data-theme` attribute (to `'light'` or `'dark'`) or class names (`.light` or `.dark`).

3. **Previous Blending Design**:
   - In the previous explorer's `analysis.md`, line 158:
     ```typescript
     blending: THREE.AdditiveBlending, // Key to neon glowing overlapped particles
     ```
   - *Observation*: The previous design used additive blending. When transitioning to a light background, additive blending will cause bright neon colors to saturate to pure white, making the particles completely invisible.

4. **Greenfield Status**:
   - In `TEST_READY.md`, lines 37-45:
     ```markdown
     Since the landing page and Next.js server are currently offline/not yet implemented, the runner operates in **Greenfield Validation Mode**.
     - Output Status: Exited with code 1 (Expected)
     - Reason: Website not implemented / server offline
     ```
   - *Observation*: The actual source code under `src/` does not exist yet. Milestone 2 will initiate the codebase construction.

---

## 2. Logic Chain

1. **Canvas ID Integration**:
   - Since E2E tests target `canvas#webgl-background` directly (Observation 1), the React component `WebGLBackground.tsx` must explicitly render `<canvas id="webgl-background" ... />`. Leaving it as only class-based would break the tests.

2. **Theme Transition Mechanism**:
   - Toggling the theme changes the HTML element's classes/attributes (Observation 2).
   - Rather than forcing React context state updates to trigger canvas component re-renders (which can degrade rendering performance), the `WebGLManager` class can use a `MutationObserver` on `document.documentElement`.
   - This observer detects changes to `data-theme` and `class` and calls `manager.setTheme('light' | 'dark')`, ensuring immediate, decoupled synchronization.

3. **High-Performance Light Mode Visual Adjustments**:
   - In dark mode, particles use bright green (`#10b981`) and cyan (`#06b6d4`).
   - In light mode, those same bright colors on a white/light gray background lose contrast and violate readability guidelines. Furthermore, using `THREE.AdditiveBlending` (Observation 3) on a light background makes particles disappear due to additive color saturation (adding color to white outputs white).
   - To avoid dynamic blend-mode switching (which triggers WebGL shader recompiles or pipeline stalls, degrading frame rate), we can use `THREE.NormalBlending` for both modes.
   - We introduce a `uThemeMode` uniform (from `0.0` for dark to `1.0` for light) and LERP its value in the animation loop.
   - The fragment shader interpolates particle colors toward darker, high-contrast counterparts (forest green `#059669` and deep cyan `#0891b2`), reduces the maximum opacity (from `0.7` to `0.25` or `0.30` to keep background text legible), and scales the vertex size down by `0.8` to ensure a clean, elegant aesthetic.

---

## 3. Caveats

- **Visual / Frame Rate Tuning**: Because the site is currently offline (Observation 4), visual quality and frame-rate diagnostics could not be run. Uniform variables and blending models have been designed according to established computer graphics rules, but final color tuning may need minor tweaks during Milestone 2.
- **Dependency on theme toggle behavior**: We assume the theme toggle will conform to the E2E contract of setting classes or attributes on `document.documentElement`. If it only updates local React state without modifying the HTML tag, the `MutationObserver` will not trigger, and a React state coupling fallback must be used instead.

---

## 4. Conclusion

The WebGL background system is fully designed to support light and dark mode switches.
1. The canvas element must have `id="webgl-background"` to meet E2E specifications.
2. A `MutationObserver` within the `WebGLManager` handles theme state detection with zero React overhead.
3. The shaders use a `uThemeMode` uniform to transition colors, opacities, and sizes smoothly:
   - Dark mode: bright neon green/cyan, high opacity (`0.7`), full size.
   - Light mode: darker green/cyan, low opacity (`0.25`), reduced size (`0.8` scale).
4. `THREE.NormalBlending` is used as a unified blending mode to prevent GPU pipeline switching stalls.

---

## 5. Verification Method

To verify the implementation during Milestone 2:
1. **Locate Target Files**: Inspect `src/components/WebGLBackground.tsx` and `src/hooks/useWebGL.ts` (once written) to verify they match the designed structures.
2. **Execute E2E Tests**: Run `npm run test:e2e` (or `npx playwright test`) to verify that the canvas is detected, the theme toggle works, and no WebGL crashes occur.
3. **Verify DOM ID**: Open browser DevTools, inspect the background canvas, and verify that the element reads `<canvas id="webgl-background">`.
4. **Theme Change Verification**: In the browser console, execute `document.documentElement.setAttribute('data-theme', 'light')` and verify the background colors and particles smoothly transition without layout shifts or console errors.
