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

Without these, `.github/workflows/cypress.yml` will run but
`authentication.cy.js`/`editing.cy.js` will fail — expected until set.

## Other recommended settings

- **Branch protection on `master`**: require the `Cypress E2E` status
  check to pass before merging, once the workflow has run successfully
  at least once with secrets configured.
- **Social preview image**: optional; a screenshot of the Mochawesome
  report or the architecture diagram in `README.md` would work well.
- **Pin the repository** on your GitHub profile if using it as
  interview/visa-application evidence — pinned repos are the first
  thing reviewers see.
