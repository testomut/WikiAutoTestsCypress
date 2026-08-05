# Contributing

This is primarily a personal reference/portfolio project, but it's
structured so it can be extended cleanly — these are the conventions
that keep it that way.

## Local setup

```bash
git clone https://github.com/testomut/WikiAutoTestsCypress.git
cd WikiAutoTestsCypress
npm ci
cp .env.example cypress.env.json   # then fill in a disposable test account
```

## Before opening a PR

```bash
npm run lint
npm run format:check
npm test
```

All three run in CI (`.github/workflows/cypress.yml`); a PR that fails
any of them won't pass checks.

## Conventions

- **No raw selectors in `cypress/e2e/*.cy.js`.** DOM interaction
  belongs in a page object under `cypress/pages/`.
- **Shared DOM workarounds go in `cypress/utils/`**, not copy-pasted
  across page objects. If you find yourself writing the same
  `$body.find(...)`-style probe in two page objects, extract it first.
- **Literal test data goes in `cypress/fixtures/testData.js`**, not
  inlined in specs, unless it's inherently per-run unique (e.g. a
  timestamp-based string).
- **New page object methods get a JSDoc `@param`/`@returns`** — see
  [`ARCHITECTURE.md`](./ARCHITECTURE.md#why-not-typescript) for why
  JSDoc instead of TypeScript at this project's size.
- **Never commit credentials.** `cypress.env.json` is gitignored;
  keep it that way. See [`SECURITY.md`](./SECURITY.md).
- **Fixed `cy.wait()` calls need a comment explaining why no
  condition-based wait was possible**, and ideally an
  `eslint-disable-next-line cypress/no-unnecessary-waiting` with the
  same reason — see the existing one in `WikipediaMainPage.js` for the
  pattern.

## Commit style

Commits in this repo's history describe _why_, not just _what_
changed — see `git log` for examples from the audit-driven rework.
Small, logically-scoped commits are preferred over one large diff.
