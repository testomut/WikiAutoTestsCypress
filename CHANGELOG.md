# Changelog

All notable changes to this project are documented here. Format based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
