# GitHub Repository Setup Recommendations

Settings that can't be changed from a local git clone — apply these
manually in the GitHub UI once this branch is reviewed and merged.

## Description

```
Portfolio Cypress automation project for Wikipedia: Page Object Model, CI smoke suite, and reference example scenarios.
```

## Topics

```
cypress
javascript
typescript
test-automation
e2e-testing
qa-automation
sdet
page-object-model
github-actions
mochawesome
ci-cd
wikipedia
```

> Note: `typescript` is included per the requested topic list for
> discoverability, even though this project deliberately stays in
> JavaScript + JSDoc at its current size (see
> [`ARCHITECTURE.md`](./ARCHITECTURE.md#why-not-typescript)). Drop it
> if you'd rather the topics exactly match the stack as shipped.

## Required repository secrets

Settings → Secrets and variables → Actions → New repository secret:

| Name                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| `CYPRESS_WIKI_USERNAME` | Username of a disposable Wikipedia test account |
| `CYPRESS_WIKI_PASSWORD` | Password for that same account                  |

Only the manually-triggered `cypress-examples.yml` needs these — the
default `cypress.yml` (smoke suite) is deliberately secret-free and
runs on every push/PR without any repository configuration. Without
these secrets, running the example scenarios (manually, or via
`npm run test:examples` locally) fails with a clear
"Missing required Cypress env var" error rather than a confusing one.

## Other recommended settings

- **Branch protection on `master`**: require the `Cypress Smoke`
  status check to pass before merging - it needs no secrets, so this
  works immediately, with no setup step first. Do not require the
  examples workflow's check — its outcome depends on Wikipedia's own
  behavior, not this repo's code (see
  [`cypress-examples.yml`](./.github/workflows/cypress-examples.yml)).
- **Running the example scenarios**: Actions tab → "Cypress Examples
  (manual)" → Run workflow. Not a merge gate.
- **Social preview image**: optional; a screenshot of the Mochawesome
  report or the architecture diagram in `README.md` would work well.
- **Pin the repository** on your GitHub profile if using it as
  interview/visa-application evidence — pinned repos are the first
  thing reviewers see.
