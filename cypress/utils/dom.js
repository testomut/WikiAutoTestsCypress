/**
 * Shared helpers for MediaWiki UI quirks that show up in more than one
 * page object: modals and menus that only sometimes render, depending
 * on account state or first-visit cookies.
 */

/**
 * Clicks `triggerSelector`, then clicks `actionSelector` only if it
 * appears within `timeoutMs` (e.g. an optional "Start editing" welcome
 * dialog). If it never shows up, this resolves without failing the
 * test - the dialog is optional by design.
 *
 * @param {string} triggerSelector - selector to click to open the dialog
 * @param {string} actionSelector - selector to click inside the dialog, if present
 * @param {number} [timeoutMs=2000] - how long to wait for the dialog to render and become visible
 */
export function clickThenDismissOptionalDialog(triggerSelector, actionSelector, timeoutMs = 2000) {
  cy.get(triggerSelector).click();
  // Give the dialog a moment to mount before checking for it - there's
  // no DOM state to assert on instead.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.get('body').then(($body) => {
    if ($body.find(actionSelector).length > 0) {
      cy.get(actionSelector, { timeout: timeoutMs }).should('be.visible').click();
    }
  });
}

/**
 * Returns true if `selector` currently exists in the DOM, without
 * throwing or waiting - used to branch on optional UI that may
 * already be open.
 *
 * @param {string} selector
 * @returns {Cypress.Chainable<boolean>}
 */
export function elementExists(selector) {
  return cy.get('body').then(($body) => $body.find(selector).length > 0);
}
