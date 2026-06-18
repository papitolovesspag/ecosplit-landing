# Scope: Implementation Remediation

## Architecture
Decompose the inlined landing page code in `src/app/page.tsx` into modular components under `src/components/` to match `PROJECT.md` and satisfy the technology/layout constraints. Correct WebGL stability, scroll calculation safety, and accessibility requirements.

## Refactoring Plan
1. **Decompose page.tsx**:
   - `src/components/Hero.tsx` from `proposed_Hero.tsx`
   - `src/components/HowItWorks.tsx` from `proposed_HowItWorks.tsx`
   - `src/components/AboutUs.tsx` from `proposed_AboutUs.tsx`
   - `src/components/Pricing.tsx` from `proposed_Pricing.tsx`
   - `src/components/ContactUs.tsx` from `proposed_ContactUs.tsx`
   - `src/app/page.tsx` from `proposed_page.tsx`
2. **Robust hooks & utilities**:
   - `src/hooks/useWebGL.ts` from `proposed_useWebGL.ts`
   - `src/app/layout.tsx` — add `suppressHydrationWarning` to the `<html>` tag to fix the hydration warning.
3. **Verification**:
   - Run production build `npm run build`.
   - Start local server and execute E2E tests `npm run test:e2e` to ensure all 63 test cases pass.

## Status
- Scope: Decompose and Remediate
- Status: IN_PROGRESS
