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
> for the audit-driven passes this repo has been through. Not a
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
  [**stable** (CI-gated, needs no secrets) vs. **external** (manually
  triggered, needs a real test account)](#stable-vs-external-test-suites)
  so CI stays a meaningful signal _and_ runs unmodified on a public
  fork. Full rationale in [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **CI status** — the badge above is the **stable** suite only
  (`cypress/e2e/stable/**`): lint, format check, and Cypress, on every
  push/PR, with no repository secrets required. See
  [Running in CI](#running-in-ci).
- **Test status** — **11 of 24** total scenarios run in the
  secret-free stable suite, confirmed passing on GitHub Actions (not
  just locally); the rest are documented, not hidden, as needing a
  real test account and/or blocked by Wikipedia's own anti-abuse
  mechanisms or an open UI-drift bug. Full breakdown →
  [`FINAL_REVIEW.md`](./FINAL_REVIEW.md).

## Quick start

```bash
git clone https://github.com/testomut/WikiAutoTestsCypress.git
cd WikiAutoTestsCypress
npm ci
npm test                # stable suite, headless - no credentials needed
npm run cypress:open    # or: interactive, pick a spec
```

Running the external suite locally needs a disposable test account -
see [Environment setup](#environment-setup).

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

- **`cypress/e2e/stable/`** (11 of the 24 total `it()` scenarios) — runs on
  every push/PR via `.github/workflows/cypress.yml`, and **needs no
  Wikipedia credentials at all** (its one authentication scenario uses
  fake login/password literals). Failures here are a real signal about
  this code, and the workflow runs unmodified on a public fork.
- **`cypress/e2e/external/`** (13 scenarios) — runs only via manual
  dispatch (`.github/workflows/cypress-external.yml` or
  `npm run test:external`), and needs a real disposable test account.
  Currently: 1 scenario should pass once credentials are set; the rest
  are blocked by a Wikimedia SSO email-verification prompt, an hCaptcha
  challenge that can trigger on any sandbox edit (even one that only
  cancels, never saves), and an undiagnosed language-selector
  UI change — none of which this suite attempts to bypass.
  See [`ARCHITECTURE.md`](./ARCHITECTURE.md#stable-vs-external-test-suites)
  for the full rationale and [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) for
  current results.

## Environment setup

Only needed to run the **external** suite - the stable suite needs no
credentials. Credentials are read via `cy.env()` with explicit
validation (see
[`ARCHITECTURE.md`](./ARCHITECTURE.md#credentials-and-the-cypress-15-env-warning)).

```bash
npm run setup:env   # creates cypress.env.json from cypress.env.example.json
```

Then fill in a **disposable test account you don't mind losing** —
never a personal or production Wikipedia account — in the new
`cypress.env.json` (gitignored). In CI, use `CYPRESS_`-prefixed
repository secrets instead — see [`.env.example`](./.env.example) and
[`SECURITY.md`](./SECURITY.md).

## Running in CI

`.github/workflows/cypress.yml` runs the stable suite on every
push/PR: Node 22, cached `npm ci`
(see [why plain `npm ci`](./ARCHITECTURE.md#ci-caching-and-install-plain-npm-ci-not-an-action)),
lint, format check, then the suite. Videos and the Mochawesome report
upload as artifacts on every run; screenshots upload on failure. **No
repository secrets are required** for this workflow.

`.github/workflows/cypress-external.yml` (manual dispatch only) runs
the external suite and does need
`CYPRESS_WIKI_USERNAME`/`CYPRESS_WIKI_PASSWORD` repository secrets —
see [`GITHUB_SETUP.md`](./GITHUB_SETUP.md).

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
