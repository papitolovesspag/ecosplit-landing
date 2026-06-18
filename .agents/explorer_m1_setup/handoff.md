# Handoff Report: Next.js Setup Strategy

## 1. Observation

1. **Root Directory Structure**:
   `list_dir` on `c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing` returned:
   ```json
   {"name":".agents", "isDir":true}
   {"name":"ORIGINAL_REQUEST.md", "sizeBytes":"1644"}
   {"name":"PROJECT.md", "sizeBytes":"4271"}
   ```
   No `package.json`, `src/`, `.gitignore`, or application files exist.

2. **Architectural Specification**:
   In `PROJECT.md` lines 3-11:
   > "EcoSplit AI is a landing page built with Next.js (App Router), Vanilla CSS, Framer Motion, and WebGL (Three.js)."
   > "Global Theme & CSS Variables: Defined in `globals.css` with a deep dark background (`#030712`), neon green (`#10b981`), neon cyan (`#06b6d4`), and glassmorphism styling..."

3. **Terminal Environment Limitations**:
   Running `node --version; npm --version; npx --version` via `run_command` in powershell returned:
   ```
   npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running 
   scripts is disabled on this system. For more information, see 
   about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
   ```
   Running `node --version; npm.cmd --version; npx.cmd --version` succeeded and returned:
   - Node: `v24.12.0`
   - NPM: `11.6.2`
   - NPX: `11.6.2`

4. **Peer Explorer Progress**:
   - `explorer_m1_theme` is in the process of defining root styles and themes.
   - `explorer_e2e_infra_1` completed E2E design report (`.agents/explorer_e2e_infra_1/handoff.md`) detailing 49 test cases and a custom runner.

---

## 2. Logic Chain

1. **Clean Init Path**:
   - Since the root directory is empty of source code (Observation 1), a full `create-next-app` initialization is safe.
   - Using the flags `--typescript`, `--eslint`, `--src-dir`, `--app`, and `--import-alias "@/*"` creates the exact file layout required in `PROJECT.md`.
   - Passing `--no-tailwind` enforces Next.js's native CSS Modules support for Vanilla CSS.

2. **Windows Compatibility Fix**:
   - Standard shell invocations of `npm` or `npx` fail due to PowerShell execution policy constraints (Observation 3).
   - Therefore, the initialization and install commands must explicitly use `npm.cmd` and `npx.cmd` to bypass this constraint on Windows systems.

3. **Dependency Conflict Prevention**:
   - Next.js 15 requires React 19 by default.
   - Modern versions of packages like `framer-motion` and `three` may have strict peer dependency rules on React 18, so installing them with `--legacy-peer-deps` is logical to prevent installation blocking.

4. **SSR Safety for Three.js**:
   - WebGL relies on Web APIs (`window`, `document.createElement('canvas')`).
   - Server-side execution of these modules in Next.js App Router leads to `window is not defined` errors.
   - Therefore, the 3D WebGL background component (`WebGLBackground.tsx`) must be dynamically imported using `next/dynamic` with `{ ssr: false }`.

---

## 3. Caveats

- **No Write Execution**: As an explorer in a read-only role, no project files were created at the root level; execution remains purely documentative.
- **Node 24 Compatibility**: Node.js `v24` is a very recent version. Some older modules could theoretically show experimental warnings; however, standard Next.js and Three.js will work cleanly.
- **Port Conflict**: The test runner from `explorer_e2e_infra_1` assumes port 3000. If that port is in use, the next dev command and runner will need a port configuration (e.g. `PORT=3001`).

---

## 4. Conclusion

The Next.js workspace must be initialized using `npx.cmd` with Tailwind CSS disabled. The layout requires client-side dynamic loading of the WebGL canvas, and Vanilla CSS will be managed globally through `globals.css` and locally using CSS modules (`*.module.css`) to prevent namespace collisions.

### Key Strategy Actions:
1. Initialize project using:
   ```powershell
   npx.cmd create-next-app@latest . --typescript --eslint --src-dir --app --import-alias "@/*" --no-tailwind --use-npm
   ```
2. Install packages:
   ```powershell
   npm.cmd install framer-motion three react-icons --legacy-peer-deps
   npm.cmd install -D @types/three --legacy-peer-deps
   ```
3. Use `next/dynamic` to load `WebGLBackground` with `ssr: false`.
4. Configure CSS variables for the deep dark/neon green/neon cyan theme in `src/app/globals.css`.

---

## 5. Verification Method

To independently verify the configuration setup after initialization:
1. **Directory Integrity Check**:
   Confirm that `src/app/layout.tsx`, `src/app/globals.css`, and `tsconfig.json` exist.
2. **Vanilla CSS Verification**:
   Inspect `package.json` to ensure `tailwindcss` is not present under `dependencies` or `devDependencies`.
3. **Build Execution**:
   Run the build script:
   ```powershell
   npm.cmd run build
   ```
   It should successfully build without typescript, linting, or server-side rendering errors.
