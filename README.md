# Wikipedia Cypress Tests

[![Cypress Smoke](https://github.com/testomut/WikiAutoTestsCypress/actions/workflows/cypress.yml/badge.svg)](https://github.com/testomut/WikiAutoTestsCypress/actions/workflows/cypress.yml)

A Cypress suite built against [en.wikipedia.org](https://en.wikipedia.org). It started as a short technical assignment in 2024 and I've since cleaned it up as a reference project — a page object model, shared DOM helpers, environment-based secrets, and a CI setup that's honest about what it actually checks.

Wikipedia is a live site I don't control. A small set of scenarios (navigation) run in CI and stay green — that's what proves the pipeline itself works. The rest of the scenarios (search, authentication, editing, language switching) are kept as examples of the same page object model but aren't part of the CI gate, because their outcome depends on Wikipedia's own UI, login flow, rate limits, and anti-abuse checks (CAPTCHA, email verification) — none of which this project tries to get around. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for why.

## What this project demonstrates

- Page Object Model and reusable DOM helpers
- A small deterministic Cypress smoke suite running in GitHub Actions
- Separation between stable CI checks and external-system test examples
- Mochawesome reporting and CI artifact collection

## Stack

Cypress 15, JavaScript with JSDoc (no TypeScript at this size — see [`ARCHITECTURE.md`](./ARCHITECTURE.md#why-not-typescript)), ESLint + Prettier, GitHub Actions, `cypress-mochawesome-reporter`.

## Getting started

```bash
git clone https://github.com/testomut/WikiAutoTestsCypress.git
cd WikiAutoTestsCypress
npm ci
npm test               # smoke suite, headless, no credentials needed
npm run cypress:open   # interactive, pick any spec
```

## Project layout

```
cypress/
  e2e/
    smoke/      # runs in CI on every push
    examples/   # everything else, run manually
  pages/        # page objects
  utils/        # shared DOM helpers, env var handling
  fixtures/     # test data
```

## Commands

| Command                          | What it does                                     |
| -------------------------------- | ------------------------------------------------ |
| `npm test`                       | Smoke suite, headless                            |
| `npm run cypress:open`           | Interactive runner                               |
| `npm run test:examples`          | Example scenarios (needs credentials, see below) |
| `npm run test:all`               | Everything                                       |
| `npm run test:ci`                | Lint + format check + smoke suite, what CI runs  |
| `npm run lint`, `npm run format` | ESLint / Prettier                                |
| `npm run report`                 | Print the path to the generated HTML report      |

## Credentials

The example scenarios that touch login need a Wikipedia account. Use a disposable one you don't mind losing — never a personal account, and note that `editing.cy.js` writes real (if trivial) edits to the public `Wikipedia:Sandbox` page.

```bash
npm run setup:env   # copies cypress.env.example.json to cypress.env.json
```

Fill in `cypress.env.json` (gitignored) locally, or set `CYPRESS_WIKI_USERNAME` / `CYPRESS_WIKI_PASSWORD` as GitHub Actions secrets to run the examples workflow from Actions → "Cypress Examples (manual)".

## Reports

`cypress-mochawesome-reporter` writes one merged HTML report per run to `cypress/reports/html/index.html`, screenshots included. Run `npm run report` for the path after a local run; in CI it's uploaded as the `mochawesome-report` artifact.

## Author

Stanislav Mokshyn — [github.com/testomut](https://github.com/testomut)

## License

[MIT](./LICENSE)
