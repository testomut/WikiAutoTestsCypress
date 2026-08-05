# Security Policy

## Scope

This is a portfolio/reference test automation project exercising the
public [en.wikipedia.org](https://en.wikipedia.org) site. It is not a
production application; there is no user data, backend, or deployed
service of its own to secure. This policy covers the repository and
its CI pipeline.

## Credential handling

- Tests read Wikipedia credentials via `Cypress.env('WIKI_USERNAME')`
  / `Cypress.env('WIKI_PASSWORD')`.
- Locally, these come from `cypress.env.json`, which is **gitignored**
  and must never be committed. See [`.env.example`](./.env.example)
  for the expected shape.
- In CI, they come from GitHub Actions repository secrets
  (`CYPRESS_WIKI_USERNAME` / `CYPRESS_WIKI_PASSWORD`), never from a
  committed file.
- **Use a disposable Wikipedia account created solely for this
  suite.** Never point this project at a personal, administrative, or
  otherwise valuable Wikipedia account. `editing.cy.js` also writes
  real edits to the public `Wikipedia:Sandbox` page — treat any
  account and any content used here as fully disposable.

## Known history

An earlier version of this repository committed `cypress.env.json`
with a plaintext username/password directly to git (present since the
initial commit). It has since been removed from tracking and replaced
with the environment-variable pattern described above. The credentials
involved belonged to a disposable test-only account with no
real-world value, so no rotation was required — but the exposure
itself was a process failure this repo's `.gitignore` and workflow now
prevent from recurring. **Anything ever committed to a public git
repository should be treated as permanently public**, regardless of
whether the file is later removed — git history retains it unless the
history itself is rewritten and force-pushed, which was out of scope
for this pass.

## Reporting a concern

If you find a security or privacy issue in this repository (e.g. a
newly committed secret, a workflow misconfiguration exposing
secrets in logs), please open a GitHub issue or contact the maintainer
directly via the profile linked in [`README.md`](./README.md#author)
rather than filing a public issue with exploit details.

## Dependencies

`npm audit` is run as part of maintaining this project; see
[`FINAL_REVIEW.md`](./FINAL_REVIEW.md) for the result as of the most
recent rework pass.
