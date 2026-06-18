## 2026-06-16T15:49:53Z

<USER_REQUEST>
You are the E2E Refinement Explorer for the EcoSplit AI landing page project.
Your working directory is: c:/Users/Chidi/Documents/Web Dev Projects/ecosplit-landing/.agents/explorer_e2e_refinement
Your parent is: 39ffdc51-fc3a-4557-b964-1772a50a0320

Your task is to analyze the existing E2E tests and describe the exact modifications needed to integrate the new user requirements:
1. 'How It Works': Change scroll animation to 4 steps (from Step 0 to Step 4) where Step 4 represents the 'AI Co-Pilot / Chatbot' feature. Update sticky scroll assertions to map to `400vh` and check for Step 4.
2. 'About Us': Verify that the layout is centered around a Founder Profile containing: founder image placeholder, founder bio placeholder, and company mission statement.
3. 'Contact Us': Verify that placeholders/icons for GitHub, LinkedIn, Email, and Phone number are present.

Please:
1. Read the existing E2E spec files under `e2e/tests/` (specifically `how-it-works.spec.js`, `about-us.spec.js`, `contact-us.spec.js`, `scenarios.spec.js`).
2. Read the existing `TEST_INFRA.md` and `TEST_READY.md`.
3. Plan the required updates to these files.
4. Output your findings in `analysis.md` and your final plan in `handoff.md` inside your folder.
5. Send a completion message back to the parent conversation.
</USER_REQUEST>
