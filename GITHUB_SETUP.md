# GitHub Repository Setup Recommendations

Settings that can't be changed from a local git clone — apply these
manually in the GitHub UI once this branch is reviewed and merged.

## Description

```
Reference Cypress UI automation framework for Wikipedia with Page Objects, CI/CD, reporting and maintainable test architecture.
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

Only the manually-triggered `cypress-external.yml` needs these — the
default `cypress.yml` (stable suite) is deliberately secret-free and
runs on every push/PR without any repository configuration. Without
these secrets, running the external suite (manually, or via
`npm run test:external` locally) fails with a clear
"Missing required Cypress env var" error rather than a confusing one.

## Other recommended settings

- **Branch protection on `master`**: require the `Cypress E2E
(Stable)` status check to pass before merging - it needs no secrets,
  so this works immediately, with no setup step first. Do not require
  the external workflow's check — it's expected to fail for reasons
  outside this repo's control (see
  [`cypress-external.yml`](./.github/workflows/cypress-external.yml)).
- **Running the external suite**: Actions tab → "Cypress External
  Suite (manual)" → Run workflow. Use it to check whether Wikipedia's
  anti-abuse behavior or the language-selector UI has changed, not as
  a merge gate.
- **Social preview image**: optional; a screenshot of the Mochawesome
  report or the architecture diagram in `README.md` would work well.
- **Pin the repository** on your GitHub profile if using it as
  interview/visa-application evidence — pinned repos are the first
  thing reviewers see.
