# Wikipedia Cypress Automation — Portfolio Project

[![Cypress Smoke](https://github.com/testomut/WikiAutoTestsCypress/actions/workflows/cypress.yml/badge.svg)](https://github.com/testomut/WikiAutoTestsCypress/actions/workflows/cypress.yml)
![Cypress](https://img.shields.io/badge/Cypress-15-04C38E?logo=cypress&logoColor=white)
![Node](https://img.shields.io/badge/Node-%3E%3D22-339933?logo=node.js&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

This is a **portfolio/reference project**: a Cypress test automation
codebase built against [en.wikipedia.org](https://en.wikipedia.org) to
demonstrate architecture and engineering decisions — a real Page
Object Model, shared utilities, environment-based secrets, CI, and
documentation that states tradeoffs rather than hiding them. It is not
a continuous quality-monitoring tool for Wikipedia, and it doesn't try
to be.

Wikipedia is a real, external system outside this project's control.
Some of the example scenarios here can be affected by Wikipedia's own
UI changes, its login/authentication flow, rate limits, and anti-abuse
mechanisms like CAPTCHA — none of which this project attempts to
bypass. See [Limitations](#limitations) below.

> Started in 2024 as a short technical assignment, then reworked
> across a few passes — see [`AUDIT.md`](./AUDIT.md) and
> [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) for that history.

## At a glance

- **Purpose** — show how a maintainable Cypress suite is put together:
  Page Object Model, shared DOM helpers instead of copy-pasted
  workarounds, environment-based secrets, linting/CI, and honest
  documentation about what does and doesn't work reliably.
- **Stack** — Cypress 15 · JavaScript + JSDoc (no TypeScript — see
  [why](./ARCHITECTURE.md#why-not-typescript)) · `cypress-mochawesome-reporter`
  · ESLint (flat config) + Prettier · GitHub Actions.
- **Key engineering decisions** — Page Object Model with zero leaked
  selectors; one reporter, not three; secrets read via `cy.env()` with
  validation, never committed; the suite split into a tiny
  [**smoke** suite (CI-gated) and **examples** (manual reference)](#smoke-vs-example-scenarios)
  so CI proves the pipeline works without depending on Wikipedia
  staying consistently green. Full rationale in
  [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **CI** — the badge above is the smoke suite only: it installs
  dependencies, checks lint/formatting, and runs a handful of
  deterministic tests. It's meant to stay green.

## Quick start

```bash
git clone https://github.com/testomut/WikiAutoTestsCypress.git
cd WikiAutoTestsCypress
npm ci
npm test                # smoke suite, headless - no credentials needed
npm run cypress:open    # or: interactive, pick a spec
```

Running the example scenarios locally needs a disposable test account
— see [Environment setup](#environment-setup).

## Commands

| Command                           | What it does                                          |
| --------------------------------- | ----------------------------------------------------- |
| `npm test`                        | Smoke suite, headless (cleans previous reports first) |
| `npm run cypress:open`            | Open the Cypress GUI runner (any spec)                |
| `npm run test:examples`           | Example scenarios — see below                         |
| `npm run test:all`                | Every spec, smoke + examples                          |
| `npm run test:ci`                 | Lint + format check + smoke suite — what CI runs      |
| `npm run lint` / `lint:fix`       | ESLint                                                |
| `npm run format` / `format:check` | Prettier                                              |
| `npm run report`                  | Print the generated Mochawesome HTML report path      |

## Smoke vs. example scenarios

- **`cypress/e2e/smoke/`** — a small set of deterministic tests that
  run on every push/PR. They exist to prove the pipeline itself works
  (dependencies install, the Cypress config is valid, lint/formatting
  pass, a real test executes end-to-end), not to monitor Wikipedia.
  Needs no credentials.
- **`cypress/e2e/examples/`** — the rest of the scenarios (search,
  language switching, authentication, editing), kept as reference
  implementations of the same Page Object Model. Run manually via
  `npm run test:examples` or the "Cypress Examples" workflow, not on
  every push. Some of these currently fail against the live site —
  documented plainly in [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) rather
  than hidden or forced green.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#smoke-vs-example-scenarios)
for the full reasoning.

## Environment setup

Only needed for the example scenarios — the smoke suite needs no
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

`.github/workflows/cypress.yml` runs the smoke suite on every
push/PR: Node 22, cached `npm ci`, lint, format check, then a handful
of tests. No repository secrets required.

`.github/workflows/cypress-examples.yml` (manual dispatch only) runs
the example scenarios and needs
`CYPRESS_WIKI_USERNAME`/`CYPRESS_WIKI_PASSWORD` repository secrets —
see [`GITHUB_SETUP.md`](./GITHUB_SETUP.md).

## Reports

A single reporter (`cypress-mochawesome-reporter`) generates one
merged HTML report per run at `cypress/reports/html/index.html`, with
screenshots embedded inline. Locally: `npm test` then `npm run
report`. In CI: download the `mochawesome-report` artifact.

## Limitations

- This demonstrates test architecture, not production-grade Wikipedia
  coverage — there's no on-call rotation or SLA behind it, and it
  isn't meant to guarantee Wikipedia's stability.
- The example scenarios run against a live, third-party site this
  project doesn't control. Wikipedia's own UI changes, login flow,
  rate limiting, and anti-abuse mechanisms (CAPTCHA, email
  verification) can all affect them, independent of anything in this
  codebase. None of those are bypassed here.
- No visual regression, accessibility, or performance testing —
  functional UI coverage only.

Full detail, including exactly which example scenarios currently pass
or fail and why, is in [`FINAL_REVIEW.md`](./FINAL_REVIEW.md).

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — folder structure, layers,
  design-decision rationale, stability strategy
- [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) — real test-run results,
  what's fixed vs. blocked
- [`AUDIT.md`](./AUDIT.md) — the original pre-rework audit
- [`SECURITY.md`](./SECURITY.md) · [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`CHANGELOG.md`](./CHANGELOG.md) · [`GITHUB_SETUP.md`](./GITHUB_SETUP.md)

## Author

**Stanislav Mokshyn** — [github.com/testomut](https://github.com/testomut)

## License

[MIT](./LICENSE)
