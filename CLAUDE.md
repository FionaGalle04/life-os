# LIFE-OS — instructions for coding agents

## Before changing code
1. Read README.md and all relevant documents in docs/.
2. Check the current repository state; do not assume prior implementation exists.
3. For a new feature, clarify acceptance criteria, write a small implementation plan, and identify tests before coding.
4. Preserve the approved product/design decisions unless the owner explicitly changes them.

## Product decisions
- Warm Soft Academia, not a dark-only interface.
- Main colors: Bordeaux #6B2438, cream #F6F0E8, dusty rose #E6D3D5, mauve #B99AA7, sage #A6AD98, dark plum-brown #3E3034.
- Use elegant serif display headings and readable sans-serif body text.
- Lots of tasteful decoration: small icons, subtle dividers, illustrations, rounded cards; keep the UI usable and not cluttered.
- Mobile workout entry is a core feature, not a later responsive afterthought.
- Support gym, cycling, running, and swimming equally.
- Do not add a habit tracker.
- Calendar, Spotify, Strava, and iCloud-related connections require explicit user authorization and must not be falsely presented as active before configured.

## Engineering rules
- TypeScript strict mode; avoid `any` unless justified.
- Prefer small, accessible, responsive components.
- Never commit secrets, access tokens, private user data, or production credentials.
- Validate all user input and define clear empty/loading/error states.
- Persist drafts safely; avoid losing workout entries on accidental navigation or temporary connection loss.
- Add or update tests for behavior changes. Run lint, typecheck, and tests before claiming completion.
- Keep a feature focused. Do not overwrite unrelated work.
- Use feature branches and pull requests for larger changes or parallel-agent contributions. Avoid simultaneous edits to the same files.
- State clearly what was implemented, what was tested, and what remains unverified.

## Superpowers workflow
Use the project's installed Superpowers skills when available. Otherwise follow the same disciplined sequence:
1. Brainstorm requirements and edge cases.
2. Write/review design specification.
3. Write a step-by-step implementation plan.
4. Implement small increments with tests.
5. Verify outcomes before marking tasks complete.
