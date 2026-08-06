# Final Review

This document reports what was actually run and observed in each
review pass — no result below is asserted without a corresponding
command output, screenshot, or curl trace captured during the work.
Newest pass first.

## Second-pass review (2026-08-06)

Branch: `fix/second-pass-review`. Scope: a focused follow-up requested
after the first pass below — no new broad refactor, only the specific
items listed here.

### What changed

1. **Doc consistency fix** — `README.md` claimed "19 `it()` scenarios";
   the real count (`grep -cE "^\s*it\(" cypress/e2e/**/*.cy.js`) is
   **24**, matching what this file already reported (13/24). Fixed in
   `README.md`; this file's count was already correct.
2. **Split stable vs. external suites** — see
   [`ARCHITECTURE.md`'s Stable vs. external test suites](./ARCHITECTURE.md#stable-vs-external-test-suites)
   for the full rationale. `cypress/e2e/stable/` (13 scenarios) vs.
   `cypress/e2e/external/` (11 scenarios); `authentication.cy.js` and
   `editing.cy.js` were split at the `it()` level since each had a mix
   of both.
3. **Default CI workflow** (`cypress.yml`) now runs only
   `cypress/e2e/stable/**` — a red run is a real signal again.
4. **New manual workflow** (`cypress-external.yml`,
   `workflow_dispatch` only) runs `cypress/e2e/external/**`, with the
   anti-abuse/UI-drift caveat written directly into the workflow file,
   not just this doc.
5. **Fixed the Cypress 15 `allowCypressEnv` warning** — added
   `cypress/utils/env.js`'s `requireEnv()`, which reads via `cy.env()`
   inside a `before()` hook instead of `Cypress.env()` at the spec's
   top level, and throws a clear error if a variable is missing. Set
   `allowCypressEnv: false` in `cypress.config.js`. See
   [`ARCHITECTURE.md`](./ARCHITECTURE.md#credentials-and-the-cypress-15-env-warning).
6. **`npm run test:ci`** now runs lint, then `format:check`, then the
   stable suite (previously skipped `format:check`).
7. **Fixed Cypress binary caching** — the previous workflow's
   `actions/cache` step ran _after_ `npm ci`, so it never actually
   cached anything (verified by reading the step order, not assumed).
   Replaced with `cypress-io/github-action@v7`, which handles
   dependency install and both npm-cache and Cypress-binary caching
   correctly out of the box. Full comparison in
   [`ARCHITECTURE.md`](./ARCHITECTURE.md#ci-caching-cypress-io-github-action-not-a-manual-cache-step).
8. **Removed the stale `docs/` report** (`git rm -r docs/`) rather than
   relabeling it — it was a static Mochawesome report from the
   project's original 2024 version with no auto-refresh mechanism, and
   this repo doesn't yet auto-publish reports anywhere (still a
   roadmap item).
9. **Trimmed `README.md`** from ~310 to ~110 lines: the first screen
   now shows purpose, stack, key engineering decisions, CI status, and
   test status before quick start. Folder structure, full design-
   decision rationale, and the detailed stability strategy moved to
   `ARCHITECTURE.md`; test-result history stays in this file.

### Validation run for real

| Check                                                             | Result                                                                                                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`                                                    | 0 errors                                                                                                                                                                                         |
| `npm run format:check`                                            | clean                                                                                                                                                                                            |
| `npm audit`                                                       | 0 vulnerabilities                                                                                                                                                                                |
| `.github/workflows/cypress.yml`, `cypress-external.yml`           | parsed successfully with `js-yaml` (installed temporarily, not committed); **not yet executed on GitHub Actions** — this file will be updated with the actual run result once pushed, not before |
| Stable suite (`npm test`), real run against live en.wikipedia.org | **13/13 passing** (see below)                                                                                                                                                                    |

**Stable suite result:** all 13 scenarios pass -
`authentication.cy.js` 2/2, `editing.cy.js` 1/1, `navigation.cy.js`
4/4, `search.cy.js` 6/6. Total run time 59s. No `allowCypressEnv`
deprecation warning printed (confirmed absent by grepping the run
output) - the `cy.env()`/`requireEnv()` fix resolved it, not just
silenced it. First run of the split suite failed at
`authentication.cy.js`'s `before all` hook with
`requireEnv()`'s own error message ("Missing required Cypress env var
WIKI_USERNAME") because the local, gitignored `cypress.env.json` was
absent in this environment - refilled with the same disposable test
account used throughout this project, then the rerun above passed
clean. That failure-then-pass sequence is itself a demonstration that
the new validation error path works as designed, not a hidden problem.

External suite (`npm run test:external`) was not re-run in this pass -
its expected-blocked status (documented in the first-pass section
below) is unrelated to any change made here, and repeatedly exercising
Wikipedia's anti-abuse systems isn't warranted just to reconfirm a
known, unchanged result.

### What this pass deliberately did not touch

- Did not attempt to diagnose or fix `language.cy.js` — still an open
  gap, per the first pass below, now simply relocated to `external/`.
- Did not attempt to solve the hCaptcha or email-verification
  challenges — same reasoning as the first pass.
- Did not add TypeScript, a new reporter, a new abstraction layer, or
  any dependency beyond what the 10 requested items required.

---

## First-pass review (2026-08-05)

Branch: `refactor/senior-sdet-rework` (merged into `master`).

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
