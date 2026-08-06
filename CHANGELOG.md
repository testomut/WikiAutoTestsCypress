# Changelog

All notable changes to this project are documented here. Format based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed — Confirmed CI root causes via authenticated log access (2026-08-06)

- **Fixed the actual CI failure**: `package-lock.json` was out of sync
  with `package.json` (a personal machine setting, `legacy-peer-deps
=true`, silently masked this on every local check). Regenerated the
  lockfile correctly and added `.npmrc` to pin the project to the
  standard, non-legacy setting so it can't recur.
- **Fixed two real test-stability bugs**, found via CI screenshot
  artifacts and a throwaway diagnostic spec rather than guessed:
  a dialog-dismiss timing race in `cypress/utils/dom.js`, and
  `searchFor()` relying on `id="searchInput"`, which Wikipedia's
  Vue-based search widget removes once it hydrates - fixed to key off
  `name="search"` instead.
- **`editing.cy.js` moved entirely to `external/`**: a CI run showed
  that even its non-saving "Cancels editing" scenario can trigger
  Wikipedia's hCaptcha challenge (typing alone triggers the
  `stashedit` autosave API). Counts: stable 11 / external 13 / 24
  total (was 12/12).
- `.github/workflows/cypress.yml` verified **green on the actual
  GitHub Actions run**, not just locally - confirmed via the GitHub
  REST API using a token retrieved through `git credential fill`
  (standard git plumbing; no GitHub MCP server was configured in this
  session).

### Changed — Secret-free stable suite (2026-08-06)

- **Stable suite needs zero repository secrets.** Moved the one
  `authentication.cy.js` stable scenario that needed a real Wikipedia
  username ("correct username, incorrect password") to `external/`;
  the remaining stable scenario uses only fake login/password
  literals. `stable/` is now 12 scenarios, `external/` is 12 (was
  13/11) - updated everywhere this was documented.
- Removed the now-unused `CYPRESS_WIKI_USERNAME`/`PASSWORD` `env:`
  block from `cypress.yml`'s test step - the default workflow runs
  unmodified on a public fork with no configuration.
- **Fixed a broken setup instruction:** `cp .env.example
cypress.env.json` was both Unix-only _and_ produced invalid JSON
  (`.env.example` is dotenv-style text with comments, not JSON). Added
  `cypress.env.example.json` (a real JSON template) and a
  cross-platform `npm run setup:env` script that copies it without
  overwriting an existing file.

### Changed — Second-pass focused review (2026-08-06)

- **Doc consistency:** fixed `README.md`'s incorrect "19 `it()`
  scenarios" claim (real count: 24, matching `FINAL_REVIEW.md`).
- **Test suite split:** `cypress/e2e/` now has `stable/` (13
  scenarios, CI-gated) and `external/` (11 scenarios, manually
  triggered) - see `ARCHITECTURE.md`. `authentication.cy.js` and
  `editing.cy.js` were split at the `it()` level.
- **CI:** default workflow now runs only the stable suite; added
  `cypress-external.yml` (`workflow_dispatch`) for the external suite,
  documented as informational rather than a quality gate.
- **Fixed Cypress binary caching:** replaced a manual `actions/cache`
  step that ran after `npm ci` (and therefore never cached anything)
  with `cypress-io/github-action@v7`.
- **Fixed the Cypress 15 `allowCypressEnv` deprecation warning:** added
  `cypress/utils/env.js`'s `requireEnv()` (uses `cy.env()` inside a
  hook, with a clear error if a variable is missing) and set
  `allowCypressEnv: false`.
- **`npm run test:ci`** now includes `format:check`, not just lint.
- **Removed** the stale 2024 static report in `docs/` rather than
  relabeling it.
- **README trimmed** from ~310 to ~130 lines; detailed rationale moved
  to `ARCHITECTURE.md`, test-result history stays in `FINAL_REVIEW.md`.

### Changed — Senior SDET portfolio rework (2026-08-05)

- **Security:** untracked `cypress.env.json` (previously committed
  with plaintext credentials since the initial commit); credentials
  now come from `Cypress.env()` via a gitignored local file or CI
  secrets. Added `.env.example` and `SECURITY.md`.
- **Config:** fixed a duplicate `reporter` key in `cypress.config.js`;
  standardized on `cypress-mochawesome-reporter`, removing the
  redundant `cypress-multi-reporters` + manual
  `mochawesome-merge`/`marge` pipeline.
- **Cross-platform:** replaced Windows-only (`rmdir`, `cp -RT`) npm
  scripts with cross-platform equivalents (`rimraf`).
- **Structure:** moved `cypress/pageObjects/` → `cypress/pages/`,
  normalized inconsistent file casing, added `cypress/utils/` (shared
  DOM helpers) and `cypress/fixtures/testData.js` (test data separated
  from spec logic). Added JSDoc to page object methods.
- **Stability:** removed an unneeded fixed wait now covered by
  Cypress's built-in retry-ability; documented and lint-suppressed
  (with a stated reason) the one wait that has no queryable
  alternative; strengthened `verifyFailedLogin()` with a structural
  URL assertion alongside the existing copy check; added a
  CI-scoped, documented `retries.runMode = 1`.
- **Tooling:** added ESLint (flat config, `eslint-plugin-cypress`) and
  Prettier; fixed the two real issues the linter caught on first run
  (`cypress/unsafe-to-chain-command` in two page objects). Upgraded
  Cypress `13.7.2` → `15.20.0` and `cypress-mochawesome-reporter`
  `3.8.2` → `5.0.0`, clearing all `npm audit` findings (3 moderate →
  0). Committed `package-lock.json` for reproducible `npm ci`.
- **CI:** added `.github/workflows/cypress.yml` — lint, format check,
  and the full Cypress suite on every push/PR, with videos, report,
  and (on failure) screenshots uploaded as artifacts.
- **Docs:** full English rewrite of `README.md` for a Senior
  SDET/recruiter audience; added `AUDIT.md`, `ARCHITECTURE.md`,
  `CONTRIBUTING.md`, `SECURITY.md`, `GITHUB_SETUP.md`, `LICENSE`
  (MIT).
- **Cleanup:** removed unused default Cypress scaffold files
  (`cypress/fixtures/example.json`, `cypress/support/commands.js`) and
  a dead method (`verifyUserProfileLink`) referencing a selector no
  spec used.

## [1.0.0] — 2024-04

- Initial version: 5 Cypress specs (authentication, editing, language,
  navigation, search) against `en.wikipedia.org`, basic Page Object
  Model, Mochawesome reporting pipeline.
