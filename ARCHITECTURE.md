# Architecture

This document explains how the suite is structured, why, and what was
deliberately left out. See [`AUDIT.md`](./AUDIT.md) for the pre-rework
state, and [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) for the real test-run
history and current pass/fail numbers.

## Folder structure

```
cypress/
  e2e/
    smoke/        # runs in the default CI workflow - see "Smoke vs example scenarios" below
    examples/     # reference scenarios, run only via manual workflow
  pages/          # Page Object Model classes
  utils/          # Shared helpers (DOM probing, env var validation)
  fixtures/       # Static/computed test data (search terms, language codes, edit text)
  support/        # Global Cypress hooks/setup
.github/workflows/
  cypress.yml          # default: lint, format check, smoke suite
  cypress-examples.yml # manual (workflow_dispatch): example scenarios
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

## Smoke vs. example scenarios

Earlier passes tried to keep every scenario green in CI, splitting
specs into a secret-free "stable" set and a "blocked" set based on
exactly which Wikimedia anti-abuse mechanism or credential each
scenario needed. That chased a moving target: Wikipedia's own
anti-abuse heuristics (an SSO email-verification prompt, an hCaptcha
challenge that can trigger on typing alone, not just saving) and its
UI internals (a Vue-hydrated search widget, a language selector) can
change or trigger unpredictably, independent of this code. A CI badge
that depends on a third-party site's behavior isn't a meaningful
quality signal, and chasing it is effort spent on the wrong thing for
a portfolio project.

So the split is simpler now, and doesn't try to track _why_ each
scenario might fail:

- **`cypress/e2e/smoke/`** — a small, deterministic set (currently
  just `navigation.cy.js`, the scenarios with the fewest moving parts)
  that runs on every push/PR via `.github/workflows/cypress.yml`. Its
  job is to prove the pipeline works - dependencies install, the
  Cypress config is valid, lint/formatting pass, a real test executes
  - not to monitor Wikipedia. Needs no repository secrets.
- **`cypress/e2e/examples/`** — everything else (`search`,
  `authentication`, `editing`, `language`), kept as reference
  implementations of the same Page Object Model. Run manually via
  `.github/workflows/cypress-examples.yml` or `npm run test:examples`.
  Current pass/fail state for each is in
  [`FINAL_REVIEW.md`](./FINAL_REVIEW.md) - reported honestly, not
  chased to green.

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

## CI caching and install: plain `npm ci`, not an action

The first version of `.github/workflows/cypress.yml` added a Cypress
binary cache step (`actions/cache` on `~/.cache/Cypress`) **after**
`npm ci` had already run — by the time the cache step executed, `npm
ci`'s postinstall had already downloaded the binary, so the cache was
restored too late to skip anything on that run, and (being positioned
after the point of use) never actually sped up a subsequent run either.

The second attempt replaced the manual cache step with the official
[`cypress-io/github-action`](https://github.com/cypress-io/github-action),
which installs dependencies and caches both the npm package cache and
the Cypress binary itself as part of what it does. On paper this was
the simpler option - one less thing to get the ordering right on. In
practice, its install-only invocation (`runTests: false`) **failed
3 out of 3 times** on this repo's actual GitHub-hosted runners, always
at the same step, with GitHub Actions' generic
`The process '.../npm' failed with exit code 1` - which carries no
diagnostic detail on its own (confirmed by finding the identical
string on an unrelated `cypress-io/github-action` issue for a
different failure entirely). Full job logs require repo-admin
authentication this environment didn't have, so the actual underlying
`npm` error was never seen.

Rather than keep guessing at a black box, the workflow now uses:

- `actions/setup-node` with `cache: 'npm'` (pins Node 22, caches npm's
  own download cache)
- `actions/cache` on `~/.cache/Cypress`, positioned **before** `npm
ci` this time - the bug this whole section is about was the
  ordering, not the mechanism
- a plain `run: npm ci` step

It's also strictly easier to debug if it ever does fail: a `run:` step
prints its full stdout/stderr directly in the log, with no extra
permissions needed to read it - unlike a wrapped third-party action,
where (as happened here) the actual error was invisible without admin
access. That transparency is exactly what confirmed the _real_ root
cause once authenticated log access was obtained: plain `npm ci` then
failed too, in 2 seconds, with a clear `EUSAGE`/lockfile-out-of-sync
error that had nothing to do with `cypress-io/github-action` at all -
see [`FINAL_REVIEW.md`](./FINAL_REVIEW.md)'s "Fourth-pass review" for
the actual log excerpt and the fix (`package-lock.json` regeneration).
The action removal above stands on its own merits (transparency,
fewer moving parts) even though it turned out not to be what was
actually broken. Losing the action's one-line convenience was worth
trading for a step that's
transparent when something goes wrong.

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

- **A small number of fixed waits**, each inline-commented and
  lint-suppressed with a reason, used only where no queryable "done"
  state exists to assert on instead: `switchLanguage()`'s menu-open
  animation; `clickThenDismissOptionalDialog()`'s one-shot check for
  whether an optional dialog rendered (a real CI failure showed this
  check can otherwise run before the dialog mounts); `searchFor()`'s
  settle time after the search-toggle click, which can either expand
  the box in place or fall through to a real page navigation.
- **Prefer stable attributes over `id` for Wikipedia's Vue-hydrated
  widgets.** `searchFor()` used to key off `id="searchInput"`, which
  only exists on the server-rendered, pre-JS markup - once Wikipedia's
  Vue-based typeahead search component hydrates (which can happen at
  any point after page load, including mid-test), it replaces that
  markup with an interactive version carrying no `id` at all. Only
  `name="search"` survives every state. Confirmed by dumping the
  actual post-interaction DOM via a throwaway diagnostic spec, not
  assumed - see `FINAL_REVIEW.md`.
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
  with an hCaptcha (see [Smoke vs. example scenarios](#smoke-vs-example-scenarios)).

## Limitations of this architecture

- No retry/backoff around the live Wikipedia site beyond
  `retries.runMode = 1` — a genuine site outage will still fail the
  run, by design (retries mask _transient_ flakiness, not outages).
- No cross-browser or mobile-viewport testing configured.
- No `cy.session()` caching yet — noted as the first thing to add if a
  future spec needs to start from an authenticated state.
- The example scenarios' pass rate depends on Wikimedia account
  reputation/anti-abuse state, which this repository cannot control
  or predict run-to-run — see [Smoke vs. example scenarios](#smoke-vs-example-scenarios).
