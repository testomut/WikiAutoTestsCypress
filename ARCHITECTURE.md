# Architecture

This document explains how the suite is structured, why, and what was
deliberately left out. See [`AUDIT.md`](./AUDIT.md) for the pre-rework
state, and [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) for the real test-run
history and current pass/fail numbers.

## Folder structure

```
cypress/
  e2e/
    stable/       # runs in the default CI workflow - reliable, code-only failures
    external/     # runs only via manual workflow - see "Stable vs external" below
  pages/          # Page Object Model classes
  utils/          # Shared helpers (DOM probing, env var validation)
  fixtures/       # Static/computed test data (search terms, language codes, edit text)
  support/        # Global Cypress hooks/setup
.github/workflows/
  cypress.yml          # default: lint, format check, stable suite
  cypress-external.yml # manual (workflow_dispatch): external suite
cypress.config.js
eslint.config.js
.prettierrc
```

## Layers

**Specs** (`cypress/e2e/**/*.cy.js`) never call `cy.get()` or reference
a selector directly. They read as a sequence of page-object method
calls plus assertions, so a non-Cypress reader can follow test intent
from the spec alone.

**Page objects** (`cypress/pages/`) are one class per logical
page/feature area (`WikipediaMainPage`, `WikipediaAuthenticationPage`,
`WikipediaSandboxPage`), each owning its own selectors and exposing
intent-named methods (`searchFor`, `switchLanguage`,
`assertChangesSaved`) rather than exposing raw locators.

**Utils** (`cypress/utils/`) hold logic shared _across_ page objects
or specs:

- `dom.js` — the "click something, then handle an optional modal that
  only sometimes renders" pattern existed independently in
  `WikipediaSandboxPage.edit()` and `WikipediaMainPage.switchLanguage()`
  before this project's first rework — same shape, copy-pasted. It now
  lives once as `clickThenDismissOptionalDialog`/`elementExists`.
- `env.js` — `requireEnv(name)`, explained under
  [Credentials and the Cypress 15 env warning](#credentials-and-the-cypress-15-env-warning).

**Fixtures** (`cypress/fixtures/testData.js`) hold data, not behavior
— a plain JS module rather than a `cy.fixture()`-loaded JSON file,
because some values are computed (`'a'.repeat(300)`, etc.) rather than
static.

## Stable vs. external test suites

A second-pass review found that this suite's pass rate depends on two
things this codebase doesn't control: Wikimedia's per-account
anti-abuse heuristics (an SSO email-verification prompt, an hCaptcha
challenge triggered by saving) and a third-party UI widget's current
markup (the language selector). Running all of that in the default CI
workflow made every run's red/green status meaningless — a red run
could mean "this PR broke something" or "Wikipedia's anti-abuse system
did its job today," with no way to tell which from the badge alone.

A closely related, second constraint applies too: this is a public
repository, and asking every contributor or forker to configure
Wikipedia credentials just to get a green CI signal is unnecessary
friction and (for a portfolio project specifically) a bar most
reviewers won't clear before giving up. So the split is on two
combined lines - outcome depends only on this code, **and** needs no
real credentials:

- **`cypress/e2e/stable/`** (12 scenarios) — needs no Wikipedia
  credentials at all, and its outcome depends only on this code and
  Wikipedia's ordinary page structure. Runs on every push/PR via
  `.github/workflows/cypress.yml`, with no repository secrets
  required. A red run here is a real signal, and the workflow runs
  unmodified on a public fork or clone.
- **`cypress/e2e/external/`** (12 scenarios) — needs a real Wikipedia
  test account, and/or is currently blocked by the anti-abuse
  mechanisms above or an undiagnosed UI-drift bug. Runs only on manual
  dispatch via `.github/workflows/cypress-external.yml`. A red run
  here is informational (drift-monitoring), not a quality gate —
  documented directly in that workflow file and in
  [`FINAL_REVIEW.md`](./FINAL_REVIEW.md).

Where a single original spec file had a mix of both (`authentication`,
`editing`), it was split at the `it()` level rather than moved
wholesale. `authentication.cy.js` specifically: its "wrong username
and wrong password" scenario uses fake literals and needs no secret,
so it's the only authentication scenario in `stable/`; "correct
username, wrong password" needs the real username (to be a meaningful
negative test at all) and moved to `external/` alongside the two
successful-login/logout scenarios that depend on it. No new spec logic
was written for this split; scenarios were relocated as-is.

## Credentials and the Cypress 15 env warning

Cypress 15 warns that `Cypress.env()` is exposed to code running
inside the app under test (the `allowCypressEnv` option, default
`true`) and will be removed in a future major version; the replacement
is the `cy.env()` command, which resolves in the test/driver process
instead. This project sets `allowCypressEnv: false` in
`cypress.config.js` and reads credentials exclusively through
`requireEnv()` in `cypress/utils/env.js`, which:

- calls `cy.env([name])` (the Chainable command only accepts an array
  of keys, unlike the deprecated single-string `Cypress.env(key)` -
  confirmed against the installed Cypress type definitions) inside a
  `before()` hook rather than at the top of the spec file, since `cy`
  commands only run within the test lifecycle; and
- throws a clear, actionable error naming the missing variable and
  pointing at `.env.example`/`SECURITY.md` if it's unset, instead of
  letting the suite fail later with a confusing "typed undefined into
  a field" error.

## Why not TypeScript

Considered and rejected for the current size of this suite: ~7 specs,
3 page objects, ~250 lines of page-object code total. TypeScript would
add a build/type-check step, `tsconfig.json`, `@types/` dependencies,
and `.ts` tooling surface — real maintenance cost — in exchange for
compile-time contracts that matter most when many contributors touch
many files across a large codebase. That isn't this project's shape.

Instead, page object methods carry JSDoc parameter types
(`/** @param {string} term */`), which gives editor autocomplete and
type hints for the exact same methods without a build step. Revisit
this decision if the suite grows enough that cross-file type drift
becomes a real risk — not preemptively.

## Why one reporter, not three

The original `cypress.config.js` declared `reporter` twice
(`cypress-mochawesome-reporter` then `cypress-multi-reporters`,
silently overwritten), and `package.json` additionally ran a manual
`mochawesome-merge` + `marge` pipeline on top. Three overlapping
mechanisms for one report is more failure-prone than one:
`cypress-mochawesome-reporter` already merges per-spec results and
embeds screenshots into a single HTML report via its own
`before:run`/`after:run` hooks, so the merge/generate scripts were
removed entirely rather than fixed.

## CI caching: cypress-io/github-action, not a manual cache step

The first version of `.github/workflows/cypress.yml` added a Cypress
binary cache step (`actions/cache` on `~/.cache/Cypress`) **after**
`npm ci` had already run — by the time the cache step executed, `npm
ci`'s postinstall had already downloaded the binary, so the cache was
restored too late to skip anything on that run, and (being positioned
after the point of use) never actually sped up a subsequent run either.

Two ways to fix this were considered:

1. **Move the manual cache step before `npm ci`.** Keeps the workflow
   structurally the same, but still requires us to own the cache key,
   the path, and correctness of the ordering — the exact class of bug
   that caused this in the first place.
2. **Use the official [`cypress-io/github-action`](https://github.com/cypress-io/github-action).**
   It installs dependencies (detecting `package-lock.json` → `npm ci`)
   and caches both the npm package cache and the Cypress binary
   itself, correctly ordered, as part of what the action does — one
   less thing this repo has to get right.

Option 2 was chosen as the simpler, more maintainable one: it deletes
the manual cache step entirely rather than just fixing its position.
The workflow still uses `actions/setup-node` to pin Node 22 explicitly
(the action doesn't manage Node version itself), then
`cypress-io/github-action` twice — once with `runTests: false` to
install/cache, once with `install: false` to run a specific `spec`
pattern — so lint/format-check can run in between using the
already-installed `node_modules` without a second install.

## Data management

- **Static/computed literals** → `cypress/fixtures/testData.js`,
  grouped by spec concern (`searchQueries`, `languageCodes`,
  `sandboxEditText`, `navigationTargets`).
- **Secrets** → never in a fixture or spec; see
  [Credentials and the Cypress 15 env warning](#credentials-and-the-cypress-15-env-warning)
  and [`SECURITY.md`](./SECURITY.md).
- **Per-run unique data** → generated inline where needed (e.g.
  `` `Test ${Date.now()}` `` in `editing.cy.js`) rather than fixtures,
  since it must differ on every run by definition.

## Stability strategy

Tests against a live, third-party, real-world site cannot be made
fully deterministic — this section is intentionally specific about
where that shows up, rather than claiming it's solved:

- **One remaining fixed wait.** `WikipediaMainPage.switchLanguage()`
  has one `cy.wait(500)`, inline-commented and lint-suppressed with a
  reason: the language menu's open animation has no queryable "done"
  state (no class flip, no event) to assert on instead.
- **Assertions on exact MediaWiki copy**, where wording is literally
  part of what's being verified (e.g. `verifyFailedLogin()`). Where a
  structural alternative existed (asserting the URL stays on the login
  page), it was added alongside the text check, not instead of it.
- **CI-only retry, scoped and documented.** `retries.runMode = 1` in
  `cypress.config.js` mitigates transient failures from the live site
  itself, only in headless/CI runs. This is not a substitute for the
  selector/assertion work described here and in `FINAL_REVIEW.md`.
- **External, shared state.** `editing.cy.js` writes to the real,
  public `Wikipedia:Sandbox` page. Each save uses a timestamped unique
  string to avoid colliding with a previous run's leftover text, but
  the suite cannot control when Wikipedia itself clears that page —
  or, as found during verification, whether it challenges the save
  with an hCaptcha (see [Stable vs. external test suites](#stable-vs-external-test-suites)).

## Limitations of this architecture

- No retry/backoff around the live Wikipedia site beyond
  `retries.runMode = 1` — a genuine site outage will still fail the
  run, by design (retries mask _transient_ flakiness, not outages).
- No cross-browser or mobile-viewport testing configured.
- No `cy.session()` caching yet — not needed today since the stable
  authentication scenarios don't complete a full login, but noted as
  the first thing to add if a future spec needs to start from an
  authenticated state.
- The external suite's pass rate depends on Wikimedia account
  reputation/anti-abuse state, which this repository cannot control
  or predict run-to-run.
