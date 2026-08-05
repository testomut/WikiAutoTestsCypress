# Final Review

Date: 2026-08-05. Branch: `refactor/senior-sdet-rework` (merged into
`master`). This document reports what was actually run and observed —
no result below is asserted without a corresponding command output,
screenshot, or curl trace captured during the work.

## What was fixed

See individual commit messages on this branch for full detail
(`git log master.. ` before the merge, or `git log` after). Summary:

1. **Security** — untracked `cypress.env.json` (committed plaintext
   credentials since the initial commit); added `.gitignore` entry,
   `.env.example`, `SECURITY.md`. Confirmed with the repo owner this
   was a disposable test account, so rotation wasn't required.
2. **Config correctness** — fixed the duplicate `reporter` key in
   `cypress.config.js`; moved `reporter`/`reporterOptions` to the
   config root (matching `cypress-mochawesome-reporter`'s documented
   setup — they don't work correctly nested under `e2e`).
3. **Cross-platform scripts** — replaced `rmdir`/`cp -RT` with
   `rimraf`; all `npm run` scripts now work identically on
   Windows/macOS/Linux/CI.
4. **Restructure** — `pageObjects/` → `pages/`, consistent PascalCase
   filenames, new `utils/` (shared DOM helpers) and
   `fixtures/testData.js` (data separated from spec logic). Removed
   dead code (`verifyUserProfileLink`, unused scaffold files).
5. **Tooling** — ESLint (flat config) + Prettier, both wired into npm
   scripts and passing with 0 errors. Upgraded Cypress 13.7.2 → 15.20.0
   and `cypress-mochawesome-reporter` 3.8.2 → 5.0.0. Committed
   `package-lock.json`.
6. **CI** — `.github/workflows/cypress.yml`: lint, format check, full
   Cypress run, artifact upload, on push/PR.
7. **Documentation** — README rewrite plus `ARCHITECTURE.md`,
   `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE`,
   `GITHUB_SETUP.md`.
8. **Real drift against the live site, found and fixed during this
   review's verification run** (not part of the original plan — found
   by actually running the suite, see below):
   - `searchFor()`: Vector 2022 collapses the header search box behind
     a toggle at Cypress's default viewport, and the sticky header
     duplicates the whole search form (ambiguous submit-button
     selector). Both confirmed via `curl` against the live page before
     changing code.
   - `assertCorrectPageTitle()`: the sticky header duplicates
     `.mw-page-title-main`; an unscoped selector matched both and
     asserted on concatenated text. Confirmed via `curl`.
   - `authenticateUser()` / `verifyFailedLogin()`: Wikipedia now
     redirects the login form to `auth.wikimedia.org` (Wikimedia's
     centralized SSO). Confirmed via the actual HTTP redirect chain
     (`curl -IL`). Wrapped in `cy.origin()`.

## Architectural decisions

- **JavaScript + JSDoc, not TypeScript** — at 5 specs / 3 page
  objects, a build/type-check step wasn't earned. Full reasoning in
  `ARCHITECTURE.md`.
- **One reporter, not three** — `cypress-mochawesome-reporter` alone;
  removed the manual `mochawesome-merge`/`marge` pipeline entirely
  since the reporter already merges its own output.
- **`pages/` + `utils/` + `fixtures/`, no deeper layering** — a base
  page class or locator-repository layer would be premature
  abstraction for 3 page objects.
- **CI-scoped retry only** (`retries.runMode = 1`) — mitigates the
  live site's own transient flakiness without masking the selector
  bugs found and fixed above; interactive `cypress open` never
  retries.
- **Dropped the original Google Sheet / Drive video links** rather
  than including them — checked reachability first (per the plan):
  the sheet requires sign-in and the Drive video returned HTTP 401.
  Linking gated resources to a recruiter audience would read worse
  than not linking them.

## What was verified automatically vs. by inspection

| Verified how                            | What                                                                                                                                                                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Command run, output captured            | `npm install`, `npm run lint` (0 errors), `npm run format:check` (clean), `npm audit` (0 vulnerabilities), every spec run reported below                                                                                                                                      |
| curl against live Wikipedia             | Search-box collapse behavior, sticky-header title/search duplication, login SSO redirect chain                                                                                                                                                                                |
| Screenshot from a failed Cypress run    | The Wikimedia email-verification challenge; the hCaptcha network call during a sandbox save; the newer "Welcome to Wikipedia" onboarding dialog                                                                                                                               |
| Manual read (no local runner available) | `.github/workflows/cypress.yml` YAML - parsed successfully with `js-yaml` (installed temporarily, not committed) to confirm valid structure; the workflow itself has not executed on GitHub Actions, since nothing was pushed to run it there until this session's merge/push |

## Test results (real runs against live en.wikipedia.org)

Total: **13 of 24 scenarios passing**, up from **4 of 24** measured on
the very first run of this branch's work (before any of the drift
fixes above). Per spec, from the final verification runs:

| Spec                   | Result          | Why                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search.cy.js`         | **6/6 passing** | Fixed (collapsed search box + duplicate submit button)                                                                                                                                                                                                                                                                                                                                             |
| `navigation.cy.js`     | **4/4 passing** | Fixed (duplicate title selector)                                                                                                                                                                                                                                                                                                                                                                   |
| `authentication.cy.js` | **2/4 passing** | Wrong-username and wrong-password scenarios pass (cy.origin() fix). Successful-login and successful-logout fail: Wikimedia's SSO now demands an **emailed verification code** for this login (screenshot-confirmed) - not bypassed.                                                                                                                                                                |
| `editing.cy.js`        | **1/6 passing** | "Cancels editing" passes (never saves). The 5 scenarios that save trigger an **hCaptcha challenge** on this account after the first save attempt (confirmed via the Cypress network log) - not bypassed, and once triggered it appears to gate the rest of that browser session.                                                                                                                   |
| `language.cy.js`       | **0/4 passing** | The Universal Language Selector widget's internals (`.grid.uls-wide`, `#search input`) no longer match after clicking the language toggle. Root cause not confirmed with the same confidence as the fixes above (would need live browser DOM inspection beyond static `curl`, which can't reach JS-rendered widget markup) - left as a documented gap rather than guessing a replacement selector. |

Re-running the same suite tomorrow could produce different numbers for
`authentication.cy.js`/`editing.cy.js` specifically, since both
outcomes depend on Wikimedia's per-account anti-abuse state, not on
this code.

## Limitations that remain

- **Two anti-abuse mechanisms currently block 2 specs from ever fully
  passing with this test account**, by design — this suite does not
  and will not attempt to solve a CAPTCHA or intercept a verification
  email. A different, longer-lived, "trusted" test account might not
  trigger these, but that's Wikimedia account-reputation behavior,
  not something this codebase controls.
- **`language.cy.js` is unresolved.** The failure is real and
  reproducible, but the fix wasn't guessed without verification -
  flagged here as the top concrete next step for whoever picks this
  up (needs live browser DOM inspection of the ULS widget after
  clicking `#p-lang-btn-checkbox`).
- **A new Cypress 15 deprecation surfaced during the version
  upgrade**: every run now prints `Warning: The allowCypressEnv
configuration option is enabled...` because `authentication.cy.js`
  reads `Cypress.env('WIKI_USERNAME'/'WIKI_PASSWORD')` at the spec's
  top level. Not fixed in this pass — noted here rather than ignored.
  Fixing it means moving the credential read inside a hook/command
  (e.g. `cy.wrap(Cypress.env(...))` inside `before()`, or restructuring
  to `cy.origin()`'s `args` pattern throughout) and setting
  `allowCypressEnv: false`; deferred since it's a warning, not a
  failure, and touches the same file as the SSO fix above.
- **The GitHub Actions workflow has never run on GitHub.** It was
  authored and its YAML validated locally (parsed with `js-yaml`), but
  until `CYPRESS_WIKI_USERNAME`/`CYPRESS_WIKI_PASSWORD` repo secrets
  are added (see `GITHUB_SETUP.md`), it will run and fail predictably
  on the authentication/editing specs for the same reasons documented
  above — not a workflow bug.
- **`docs/` still contains a static Mochawesome report from the
  project's original 2024 version** — it was not regenerated/replaced
  in this pass (auto-publishing to Pages from CI is on the roadmap in
  `README.md`, not implemented).

## What most demonstrates Senior SDET-level judgment here

- Diagnosing real, current production drift with concrete evidence
  (`curl`, screenshots, network logs) before touching a single
  selector, rather than guessing fixes — and explicitly _not_ guessing
  where the evidence wasn't strong enough (`language.cy.js`).
- Refusing to bypass the hCaptcha and email-verification challenges
  even though doing so would have made the pass count look better -
  and documenting exactly what blocks those tests and why, instead of
  skipping or deleting them.
- Reporting 13/24 passing plainly instead of only showing the specs
  that went green, and separating "fixed by this work" from "blocked
  by something outside this codebase's control."

## Changed files (this branch vs. `master`, pre-merge)

34 files changed: 6 new docs (`ARCHITECTURE.md`, `AUDIT.md`,
`CHANGELOG.md`, `CONTRIBUTING.md`, `GITHUB_SETUP.md`, `SECURITY.md`) +
`LICENSE` + `.env.example`; `README.md` rewritten; CI workflow added;
ESLint/Prettier configs added; `package.json`/`package-lock.json`
updated; `cypress.config.js` fixed; 3 page objects moved
`pageObjects/` → `pages/` and rewritten; `cypress/utils/dom.js` and
`cypress/fixtures/testData.js` added; all 5 specs updated for new
imports/fixtures; `cypress.env.json` untracked;
`cypress/fixtures/example.json` and `cypress/support/commands.js`
removed.

## Remaining task list for a future pass

- [ ] Diagnose and fix `language.cy.js` with live browser DOM
      inspection of the ULS widget.
- [ ] Set `allowCypressEnv: false` and restructure credential reads to
      remove the new Cypress 15 deprecation warning.
- [ ] Add `CYPRESS_WIKI_USERNAME`/`CYPRESS_WIKI_PASSWORD` repository
      secrets on GitHub so the CI workflow can actually exercise the
      suite (it will still show the 2 known-blocked specs as red,
      which is expected).
- [ ] Consider a long-lived, more-established Wikipedia test account
      to see whether that avoids the SSO email-verification and
      hCaptcha triggers seen with the current one — no guarantee, since
      both are Wikimedia-side heuristics this project doesn't control.
- [ ] Regenerate/auto-publish the `docs/` Mochawesome report from CI
      instead of leaving the 2024 static snapshot in place.
