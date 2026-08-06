/**
 * Shared DOM helpers for dealing with MediaWiki UI quirks that both
 * WikipediaMainPage and WikipediaSandboxPage need independently:
 * transient modals/menus that only sometimes render, depending on
 * account state, first-visit cookies, or animation timing.
 *
 * A fixed cy.wait() is not eliminated entirely here — MediaWiki's
 * modal/menu open animation has no reliably queryable "done" state
 * (no class change, no event) — but it is scoped to a single shared
 * helper and documented, rather than duplicated ad hoc in every page
 * object that happens to hit the same UI behaviour.
 */

/**
 * Clicks `triggerSelector`, then clicks `actionSelector` only if it
 * became visible within `timeoutMs` (e.g. an optional "Start editing"
 * welcome dialog). If it never appears, this resolves without failing
 * the test — the dialog is optional by design.
 *
 * The presence check itself is a one-shot DOM snapshot (Cypress's
 * `.then()` does not retry), so a short bounded wait runs first to
 * give the dialog a chance to actually mount before that snapshot is
 * taken - confirmed necessary by a real CI failure: on a slower
 * runner, the snapshot ran before the dialog rendered, missed it, and
 * the dialog then appeared moments later and blocked the next
 * interaction. Not fully eliminable the same way the module docblock
 * already explains for the render-completion side of this problem.
 *
 * @param {string} triggerSelector - selector to click to open the dialog
 * @param {string} actionSelector - selector to click inside the dialog, if present
 * @param {number} [timeoutMs=2000] - bounded wait for the optional dialog to render and become visible
 */
export function clickThenDismissOptionalDialog(triggerSelector, actionSelector, timeoutMs = 2000) {
  cy.get(triggerSelector).click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting -- see docblock above: the existence check below is a one-shot snapshot with no retry, so it needs the dialog to have already mounted.
  cy.wait(500);
  cy.get('body').then(($body) => {
    if ($body.find(actionSelector).length > 0) {
      cy.get(actionSelector, { timeout: timeoutMs }).should('be.visible').click();
    }
  });
}

/**
 * Returns true if `selector` currently exists in the DOM, without
 * throwing or waiting — used to branch behaviour around optional UI
 * (e.g. a language menu that may already be open).
 *
 * @param {string} selector
 * @returns {Cypress.Chainable<boolean>}
 */
export function elementExists(selector) {
  return cy.get('body').then(($body) => $body.find(selector).length > 0);
}
