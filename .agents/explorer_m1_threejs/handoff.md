# Handoff Report: WebGL Background Canvas Design

This handoff report is prepared by Explorer 2 (ThreeJS Background Explorer) for Milestone 1 / Milestone 2 implementation. It details the design strategy, findings, and light/dark theme support for the WebGL fluid neon background.

---

## 1. Observation

- **Project File Structure**: The project root is currently unitialized. Running `list_dir` on the project root `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing` returned:
  ```json
  {"name":".agents", "isDir":true}
  {"name":"ORIGINAL_REQUEST.md", "sizeBytes":"1644"}
  {"name":"PROJECT.md", "sizeBytes":"4271"}
  ```
- **Requirements Specifications**: In `PROJECT.md` lines 4-11, the architecture is defined as:
  > "EcoSplit AI is a landing page built with Next.js (App Router), Vanilla CSS, Framer Motion, and WebGL (Three.js)."
  > "- WebGL/Three.js Background: A background canvas overlaying the page with fluid 3D abstract neon particles, reacting to scroll/mouse movements."
- **Updated Requirement**: We received a high-priority message from the implementation sub-orchestrator (`f02cb98d-02be-40ca-acf5-8161a3095383`) at `2026-06-16T15:24:59Z`:
  > "**Content**: We have received an updated requirement: a seamless light/dark mode toggle must be supported. The WebGL background must adjust for light mode (e.g. modify particle colors, background color, or visibility to align with light mode visual aesthetics)."

---

## 2. Logic Chain

1. **Client-Side Initialization**: Since Next.js uses server-side pre-rendering, direct references to `window`, `document`, and canvas elements will throw compilation or runtime errors during server build. Therefore, `WebGLBackground` must declare `"use client"` and use a dynamic import with `ssr: false` in pages that embed it (e.g., `src/app/page.tsx`).
2. **Organic Particle Animation**: To simulate "fluid" movement without heavy physics engines, we can compute displacement on the GPU using a 3D Simplex Noise algorithm written in GLSL. We pass `uTime`, `uScroll`, and `uMouse` uniforms.
3. **Smooth Scroll Integration**: Standard scroll listeners can bottleneck Next.js render performance. Instead of adding a `'scroll'` window event listener, reading `window.scrollY` and updating uniforms inside the `requestAnimationFrame` render loop eliminates scroll event overhead entirely.
4. **Theme Transitions**: Modifying the WebGL context or rebuilding the particle system from scratch upon toggling light/dark mode would result in a visual flash and frame stutter. To resolve this:
   - The theme state (`themeMode: 'light' | 'dark'`) is passed down as a prop to `WebGLBackground` and forwarded to the `useWebGL` hook.
   - The `WebGLManager` exposes a public method `setThemeMode(themeMode)`.
   - When theme changes, `setThemeMode` updates uniforms `uColorGreen` and `uColorCyan` dynamically.
   - It toggles the material's `blending` property from `THREE.AdditiveBlending` (dark mode neon glow) to `THREE.NormalBlending` (light mode visibility) and triggers `material.needsUpdate = true` to force compilation/pipeline update on the next frame.
   - A CSS transition on the background container changes the viewport backing fill smoothly (`transition: background-color 0.5s ease`).

---

## 3. Caveats

- **Device Performance**: While 7,000-8,000 particles is safe on modern devices, older mobile GPUs could drop frames if the pixel ratio is too high. Cap the pixel ratio strictly at `Math.min(window.devicePixelRatio, 2.0)` to avoid fill-rate bottlenecks.
- **Context Loss**: Heavy page operations, browser tabs backgrounding, or system sleep can lose the WebGL context. The design includes `webglcontextlost` and `webglcontextrestored` listeners to handle this, which must be implemented as specified.

---

## 4. Conclusion

The WebGL background should be implemented using a combination of a React component (`src/components/WebGLBackground.tsx`), a React hook (`src/hooks/useWebGL.ts`), and a helper class `WebGLManager` inside that hook file. This keeps the rendering code cleanly isolated from React render cycles, guarantees clean resource disposal on page transitions, and supports dynamic theme switching (blending & color transition) with zero frame stutter.

---

## 5. Verification Method

To independently verify the implementation once files are created:
1. **Inspecting Canvas Element**: Use browser developer tools to verify `<canvas>` is mounted inside a container with class `webgl-background-container` and style `position: fixed; z-index: -2; pointer-events: none;`.
2. **Event Verification**: Move the mouse across the page and scroll; verify that particles displace away from the cursor and rise smoothly with page scrolling.
3. **Theme Toggle Test**: Toggle the page's theme. Verify that:
   - The background container transitions background-color smoothly.
   - Particles transition colors instantly (neon green `#10b981` & neon cyan `#06b6d4` in dark mode, to forest green `#047857` & ocean cyan `#0284c7` in light mode).
   - Particle overlapping blending transitions seamlessly without visual artifacts.
4. **Memory Verification**: Mount and unmount the component repeatedly (e.g. by navigating pages or toggling component mount status). Check that the animation frame loop is cancelled (zero render logs/errors in console) and WebGL contexts are properly disposed.
