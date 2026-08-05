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
 * @param {string} triggerSelector - selector to click to open the dialog
 * @param {string} actionSelector - selector to click inside the dialog, if present
 * @param {number} [timeoutMs=1000] - bounded wait for the optional dialog to render
 */
export function clickThenDismissOptionalDialog(triggerSelector, actionSelector, timeoutMs = 1000) {
  cy.get(triggerSelector).click();
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
