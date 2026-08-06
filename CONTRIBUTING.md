# Contributing

Personal project, but structured so it's easy to extend. A few conventions that keep it that way:

- No raw selectors in spec files — DOM interaction belongs in a page object under `cypress/pages/`.
- If the same DOM workaround shows up in two page objects, move it into `cypress/utils/` instead of copy-pasting.
- Literal test data goes in `cypress/fixtures/testData.js`, not inlined in specs, unless it's inherently per-run unique (like a timestamp).
- New page object methods get a JSDoc `@param` — see [`ARCHITECTURE.md`](./ARCHITECTURE.md#why-not-typescript) for why JSDoc instead of TypeScript here.
- Never commit `cypress.env.json` — it's gitignored on purpose.
- If you add a fixed `cy.wait()`, comment why no condition-based wait was possible.

Before opening a PR:

```bash
npm run lint
npm run format:check
npm test
```

All three run in CI; a PR that fails one of them won't pass checks.
