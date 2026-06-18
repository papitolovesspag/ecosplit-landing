# Handoff Report — CSS Theme Explorer (Milestone 1)

This report details the observations, logic, and proposals for the global CSS theme, layout structure, and folder layout of the EcoSplit AI landing page.

---

## 1. Observation

- **Architecture Details**:
  In `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/PROJECT.md`, it states:
  > "EcoSplit AI is a landing page built with Next.js (App Router), Vanilla CSS, Framer Motion, and WebGL (Three.js)."
  > "Global Theme & CSS Variables: Defined in globals.css with a deep dark background (#030712), neon green (#10b981), neon cyan (#06b6d4), and glassmorphism styling (backdrop-filter, border-transparency, radial gradient backgrounds)."
- **Workspace File Scan**:
  A file search of the project root directory using `find_by_name` returned:
  ```
  Found 2 results
  ORIGINAL_REQUEST.md
  PROJECT.md
  ```
  This indicates that framework files, styles, and components have not yet been generated.
- **Workflow / Timelines**:
  In `.agents/orchestrator/BRIEFING.md`, we see that:
  - Milestone 1 ("Project Setup & WebGL Background") is currently `IN_PROGRESS`.
  - The implementation is split among three concurrent explorers: Setup (`explorer_m1_setup`), WebGL (`explorer_m1_threejs`), and Theme (`explorer_m1_theme`).

---

## 2. Logic Chain

1. **Vanilla CSS Requirements**: Since the codebase uses Vanilla CSS, we cannot use Tailwind CSS utility classes. Therefore, standard theme properties (colors, borders, glows) must be defined as native CSS custom properties under the `:root` pseudo-class in `globals.css`.
2. **Color Constants**: The project documentation dictates a deep dark background (`#030712`), neon green (`#10b981`), and neon cyan (`#06b6d4`). These map directly to:
   - `--color-bg: #030712;`
   - `--color-neon-green: #10b981;`
   - `--color-neon-cyan: #06b6d4;`
3. **Glow States & Opacity**: To prevent harsh borders and achieve the "vibrant neon borders" described in `PROJECT.md`, we need translucent variables for shadows and overlays, e.g. `rgba(16, 185, 129, 0.15)` and `rgba(6, 182, 212, 0.15)`.
4. **Glassmorphism Spec**: Glassmorphic panels require `backdrop-filter: blur(16px)` along with border transparency (`rgba(255, 255, 255, 0.08)`) and radial gradient backgrounds for smooth ambient shading.
5. **Next.js Layout & Typography**: `layout.tsx` must envelope the entire application, load standard web-safe or premium Google Fonts, and initialize global styling.
   - For a tech-focused AI visual system, `Plus_Jakarta_Sans` (for body/headers) and `JetBrains_Mono` (for mono accents) loaded via `next/font/google` are ideal.
   - These loaded fonts can be mapped to custom CSS variables (`--font-sans` and `--font-mono`) to integrate them seamlessly into the CSS styles.
6. **WebGL Canvas Integration**: Because the WebGL background renders under all elements, the layout must place `<WebGLBackground />` at the root and wrap page contents in a relative container with a higher z-index (`z-index: 10`).
7. **Directory Modularization**: To maintain code organization:
   - Low-level reusable UI primitives go in `src/components/ui/`.
   - Custom React Hooks go in `src/hooks/`.
   - To prevent styling naming conflicts in Vanilla CSS, component-level styles should use **CSS Modules** (`[Component].module.css`) rather than a single massive stylesheet.

---

## 3. Caveats

- **No Implementation Done**: This is a read-only investigation. Actual file creation and editing must be carried out by the setup/worker agent.
- **Client Canvas Component**: We assume that `WebGLBackground.tsx` is written as a Next.js Client Component (`"use client"`) to safely access the browser's `window` and canvas API.
- **Font Availability**: Standard Next.js builds compile google fonts at build-time. We assume internet connectivity is available in the compiler build environment to resolve `next/font/google`.

---

## 4. Conclusion

To implement the required visual system:
1. **`src/app/globals.css`** must define the custom properties for background `#030712`, neon accents, and glassmorphic parameters on `:root`. It must also provide global class definitions for `.glass-panel`, `.btn-neon-*`, `.glass-card-neon-*`, and `.ambient-orb`.
2. **`src/app/layout.tsx`** must load `Plus_Jakarta_Sans` and `JetBrains_Mono` via `next/font/google`, inject them as CSS variables, load `globals.css`, mount `WebGLBackground` at the root level, and wrap pages in a high-z-index layout envelope.
3. **Directory Structure** must separate core views, low-level primitives (`src/components/ui/`), custom hooks (`src/hooks/`), static assets (`public/assets/`), and utilize CSS Modules (`[Component].module.css`) for UI component styling.

---

## 5. Verification Method

To independently verify the implementation:
1. **File Checks**: Confirm the existence and contents of:
   - `src/app/globals.css` (check variables and class definitions).
   - `src/app/layout.tsx` (check font imports, background layout, and styles).
   - `src/components/ui/` and `src/hooks/` directories.
2. **Theme Inspections**: Ensure that class names `.glass-panel`, `.glass-card-neon-green`, and `.glass-card-neon-cyan` are successfully utilized by components.
3. **Build Execution**: Run the Next.js compilation:
   ```bash
   npm run build
   ```
   Verify that the build completes successfully with no CSS Module parsing errors or font loading issues.
