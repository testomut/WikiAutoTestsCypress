# Architecture

This document explains how the suite is structured, why, and what was
deliberately left out. See [`AUDIT.md`](./AUDIT.md) for the full
before-state this architecture replaced.

## Layers

```
cypress/e2e/*.cy.js        <- scenarios (what), read like requirements
cypress/pages/*.js         <- page objects (how), all DOM interaction
cypress/utils/dom.js       <- shared low-level DOM helpers used by pages
cypress/fixtures/testData.js <- literal test data, no logic
cypress/support/e2e.js     <- global Cypress setup (reporter registration)
cypress.config.js          <- runner config, reporter config, retries
```

**Specs** never call `cy.get()` or reference a selector directly. They
read as a sequence of page-object method calls plus assertions, so a
non-Cypress reader can follow test intent from the spec alone.

**Page objects** are one class per logical page/feature area
(`WikipediaMainPage`, `WikipediaAuthenticationPage`,
`WikipediaSandboxPage`), each owning its own selectors and exposing
intent-named methods (`searchFor`, `switchLanguage`,
`assertChangesSaved`) rather than exposing raw locators.

**Utils** hold logic shared _across_ page objects. Before this rework,
the "click something, then handle an optional modal that only
sometimes renders" pattern existed independently in
`WikipediaSandboxPage.edit()` and `WikipediaMainPage.switchLanguage()`
— same shape, copy-pasted. `cypress/utils/dom.js` now owns that once
(`clickThenDismissOptionalDialog`, `elementExists`), and both page
objects call it.

**Fixtures** hold data, not behavior. `testData.js` is a plain JS
module (not a `cy.fixture()`-loaded JSON file) because some values are
computed (e.g. `'a'.repeat(300)`, `'abqwertyui'.repeat(45)`) rather
than static — a `.json` file can't express that, and splitting
computed vs. static data into two different files/mechanisms for 4
small objects wasn't worth the indirection.

## Why not TypeScript

Considered and rejected for the current size of this suite: 5 specs,
3 page objects, ~250 lines of page-object code total. TypeScript would
add a build/type-check step, `tsconfig.json`, `@types/` dependencies,
and `.ts` tooling surface — real maintenance cost — in exchange for
compile-time contracts that matter most when many contributors touch
many files across a large codebase. That isn't this project's shape.

Instead, page object methods carry JSDoc parameter types
(`/** @param {string} term */`), which gives editor autocomplete and
type hints for the exact same methods without a build step. If this
suite grows to the point where cross-file type drift becomes a real
risk (many more page objects, shared complex data shapes, multiple
contributors), TypeScript is the natural next step — revisit this
decision then, not preemptively.

## Why one reporter, not three

The original `cypress.config.js` declared `reporter` twice
(`cypress-mochawesome-reporter` then `cypress-multi-reporters`,
silently overwritten), and `package.json` additionally ran a manual
`mochawesome-merge` + `marge` pipeline on top. Three overlapping
mechanisms for one report is more failure-prone than one:
`cypress-mochawesome-reporter` already merges per-spec results and
embeds screenshots into a single HTML report via its own
`before:run`/`after:run` hooks (registered in `cypress.config.js`'s
`setupNodeEvents` and `cypress/support/e2e.js`), so the merge/generate
scripts were removed entirely rather than fixed.

## Data management

- **Static/computed literals** → `cypress/fixtures/testData.js`,
  grouped by spec concern (`searchQueries`, `languageCodes`,
  `sandboxEditText`, `navigationTargets`).
- **Secrets** → never in a fixture or spec. Read via `Cypress.env()`
  from a gitignored `cypress.env.json` locally, or from
  `CYPRESS_`-prefixed environment variables (GitHub Actions secrets)
  in CI. See [`SECURITY.md`](./SECURITY.md).
- **Per-run unique data** → generated inline where needed (e.g.
  `` `Test ${Date.now()}` `` in `editing.cy.js`) rather than fixtures,
  since it must differ on every run by definition.

## CI

`.github/workflows/cypress.yml`: Node 22 (matching this project's
`engines.node` and `cypress-mochawesome-reporter@5`'s requirement) →
`npm ci` → cached Cypress binary → lint → format check → headless
Cypress run → upload videos/report (always) and screenshots
(on failure). One job, no matrix — a 5-spec suite doesn't need
parallelization or cross-browser fan-out yet; see
[Roadmap in README.md](./README.md#roadmap) for what would justify
adding it.

## Limitations of this architecture

- No retry/backoff around the live Wikipedia site beyond
  `retries.runMode = 1` — a genuine site outage will still fail the
  run, by design (retries mask _transient_ flakiness, not outages).
- No cross-browser or mobile-viewport testing configured.
- No `cy.session()` caching yet — not needed today since
  `authentication.cy.js` tests login itself, but noted as the first
  thing to add if any other spec needs to start from an authenticated
  state.
