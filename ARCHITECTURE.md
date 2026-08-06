# Architecture

## Layers

```
cypress/e2e/**/*.cy.js   scenarios - read like requirements, no selectors
cypress/pages/*.js       page objects - one class per page/feature area
cypress/utils/           shared helpers used by more than one page object
cypress/fixtures/        test data, separate from test logic
```

Specs never call `cy.get()` directly — all DOM interaction goes through a page object method (`searchFor`, `switchLanguage`, `assertChangesSaved`, etc.), so a spec reads as a sequence of user actions and assertions.

`cypress/utils/dom.js` holds a couple of small helpers for patterns that showed up in more than one page object (dismissing an optional modal, checking if an element exists without failing). `cypress/utils/env.js` has `requireEnv()`, used for reading credentials — see below.

## Smoke vs. examples

`cypress/e2e/smoke/` is what runs in CI on every push. It's deliberately small (just navigation right now) and needs no credentials — its job is to prove the pipeline works, not to check Wikipedia's health.

`cypress/e2e/examples/` has the rest: search, authentication, editing, language switching. These are reference implementations of the same page object model, run manually (`npm run test:examples` or the "Cypress Examples" workflow). I don't gate CI on them because their pass rate depends on things outside this repo: Wikipedia's own UI (a Vue-hydrated search widget that changes its DOM after load), its login flow (which now requires an email verification step for this test account), and its anti-abuse system (an hCaptcha challenge that can trigger just from typing into the sandbox editor, not only on save). None of that is bypassed here — a red run in the examples workflow just means Wikipedia's behavior or UI has shifted again.

## Credentials

Cypress 15 deprecated reading secrets via `Cypress.env()` at the top of a spec file, since that value is exposed to code running inside the page under test. `requireEnv()` in `cypress/utils/env.js` reads via `cy.env()` inside a `before()` hook instead, and throws a clear error if a variable is missing rather than letting a test fail later with a confusing "typed undefined into a field" message.

Locally, credentials come from a gitignored `cypress.env.json` (`npm run setup:env` creates it from `cypress.env.example.json`). In CI, they're `CYPRESS_`-prefixed repository secrets. Use a disposable Wikipedia account — never a real one.

## Why not TypeScript

Five specs, three page objects, a few hundred lines total. TypeScript would mean a build step, `tsconfig.json`, and `@types/` packages for a codebase small enough that JSDoc on the page object methods already gives editor autocomplete and type hints. Worth revisiting if this grows a lot; not worth it now.

## Reporting

`cypress-mochawesome-reporter` is the only reporter configured — it merges per-spec results and embeds screenshots into one HTML report on its own, so there's no separate merge or generate step to maintain.

## CI

The workflow caches the Cypress binary (`actions/cache` on `~/.cache/Cypress`, keyed on the lockfile, restored before `npm ci` runs) and installs with a plain `npm ci` — no third-party install action. That's mostly for transparency: a `run:` step prints its full output in the log, which matters when something in the install actually breaks.

## Known limitations

- No cross-browser or mobile-viewport coverage.
- No `cy.session()` caching — not needed yet since nothing depends on starting from an already-authenticated state.
- `editing.cy.js` writes to the real, public `Wikipedia:Sandbox` page. Each save uses a timestamped string so repeated runs don't collide, but the suite can't control when Wikipedia clears that page or whether a save triggers a CAPTCHA.
- A couple of fixed `cy.wait()` calls remain in the page objects (language menu animation, an optional dialog's render timing) where there's no DOM state to assert on instead — each is commented with why.
