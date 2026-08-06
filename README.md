# Wikipedia Cypress Test Automation Framework

[![Stable Suite](https://github.com/testomut/WikiAutoTestsCypress/actions/workflows/cypress.yml/badge.svg)](https://github.com/testomut/WikiAutoTestsCypress/actions/workflows/cypress.yml)
![Cypress](https://img.shields.io/badge/Cypress-15-04C38E?logo=cypress&logoColor=white)
![Node](https://img.shields.io/badge/Node-%3E%3D22-339933?logo=node.js&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A reference Cypress automation framework demonstrating scalable UI
test architecture, reusable page abstractions, cross-platform
execution, CI integration, and maintainable reporting — exercised
end-to-end against the live [en.wikipedia.org](https://en.wikipedia.org).

> Started in 2024 as a short technical assignment; reworked into a
> Senior SDET **portfolio/reference project** — see
> [`AUDIT.md`](./AUDIT.md) and [`FINAL_REVIEW.md`](./FINAL_REVIEW.md)
> for the two audit-driven passes this repo has been through. Not a
> production test suite for a company-owned application — see
> [`ARCHITECTURE.md`'s Limitations](./ARCHITECTURE.md#limitations-of-this-architecture).

## At a glance

- **Purpose** — exercise core Wikipedia user journeys (search,
  navigation, language switching, authentication, editing) as a
  demonstration of maintainable Cypress architecture: real Page
  Object Model, shared utilities, environment-based secrets, CI gates,
  and documentation that states tradeoffs rather than hiding them.
- **Stack** — Cypress 15 · JavaScript + JSDoc (no TypeScript — see
  [why](./ARCHITECTURE.md#why-not-typescript)) · `cypress-mochawesome-reporter`
  · ESLint (flat config) + Prettier · GitHub Actions.
- **Key engineering decisions** — Page Object Model with zero leaked
  selectors; one reporter, not three; secrets read via `cy.env()`
  with validation, never committed; test suite split into
  [**stable** (CI-gated) vs. **external** (manually triggered)](#stable-vs-external-test-suites)
  so CI stays a meaningful signal. Full rationale in
  [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **CI status** — the badge above is the **stable** suite only
  (`cypress/e2e/stable/**`): lint, format check, and Cypress, on every
  push/PR. See [Running in CI](#running-in-ci).
- **Test status** — **13 of 24** total scenarios currently pass
  against live Wikipedia; the rest are documented, not hidden, as
  blocked by Wikipedia's own anti-abuse mechanisms or an open UI-drift
  bug. Full breakdown → [`FINAL_REVIEW.md`](./FINAL_REVIEW.md).

## Quick start

```bash
git clone https://github.com/testomut/WikiAutoTestsCypress.git
cd WikiAutoTestsCypress
npm ci
cp .env.example cypress.env.json   # fill in a DISPOSABLE test account - see SECURITY.md
npm test                            # stable suite, headless
npm run cypress:open                # or: interactive, pick a spec
```

## Commands

| Command                           | What it does                                           |
| --------------------------------- | ------------------------------------------------------ |
| `npm test`                        | Stable suite, headless (cleans previous reports first) |
| `npm run cypress:open`            | Open the Cypress GUI runner (any spec)                 |
| `npm run test:external`           | External/blocked suite — see below                     |
| `npm run test:all`                | Every spec, stable + external                          |
| `npm run test:ci`                 | Lint + format check + stable suite — what CI runs      |
| `npm run lint` / `lint:fix`       | ESLint                                                 |
| `npm run format` / `format:check` | Prettier                                               |
| `npm run report`                  | Print the generated Mochawesome HTML report path       |

## Stable vs. external test suites

- **`cypress/e2e/stable/`** (13 of the 24 total `it()` scenarios) — runs on
  every push/PR via `.github/workflows/cypress.yml`. Failures here are
  a real signal about this code.
- **`cypress/e2e/external/`** — runs only via manual dispatch
  (`.github/workflows/cypress-external.yml` or `npm run test:external`).
  Currently blocked by a Wikimedia SSO email-verification prompt, an
  hCaptcha challenge triggered by saving, and an undiagnosed language-
  selector UI change — none of which this suite attempts to bypass.
  See [`ARCHITECTURE.md`](./ARCHITECTURE.md#stable-vs-external-test-suites)
  for the full rationale and [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) for
  current results.

## Environment setup

The authentication specs need Wikipedia credentials, read via
`cy.env()` with explicit validation (see
[`ARCHITECTURE.md`](./ARCHITECTURE.md#credentials-and-the-cypress-15-env-warning)).
Copy [`.env.example`](./.env.example) — either a gitignored
`cypress.env.json` locally, or `CYPRESS_`-prefixed environment
variables in CI. **Use a disposable test account you don't mind
losing** — never a personal or production Wikipedia account. See
[`SECURITY.md`](./SECURITY.md).

## Running in CI

`.github/workflows/cypress.yml` runs the stable suite on every
push/PR: Node 22, dependency + Cypress-binary caching via
[`cypress-io/github-action`](https://github.com/cypress-io/github-action)
(see [why](./ARCHITECTURE.md#ci-caching-cypress-io-github-action-not-a-manual-cache-step)),
lint, format check, then the suite. Videos and the Mochawesome report
upload as artifacts on every run; screenshots upload on failure.

**Setup required:** add `CYPRESS_WIKI_USERNAME`/`CYPRESS_WIKI_PASSWORD`
as repository secrets (Settings → Secrets and variables → Actions) —
see [`GITHUB_SETUP.md`](./GITHUB_SETUP.md). Until then, the two
credential-dependent stable scenarios fail predictably.

## Reports

A single reporter (`cypress-mochawesome-reporter`) generates one
merged HTML report per run at `cypress/reports/html/index.html`, with
screenshots embedded inline. Locally: `npm test` then `npm run
report`. In CI: download the `mochawesome-report` artifact.

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — folder structure, layers,
  design-decision rationale, stability strategy, limitations
- [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) — real test-run results,
  what's fixed vs. blocked, roadmap
- [`AUDIT.md`](./AUDIT.md) — the original pre-rework audit
- [`SECURITY.md`](./SECURITY.md) · [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`CHANGELOG.md`](./CHANGELOG.md) · [`GITHUB_SETUP.md`](./GITHUB_SETUP.md)

## Author

**Stanislav Mokshyn** — [github.com/testomut](https://github.com/testomut)

## License

[MIT](./LICENSE)
