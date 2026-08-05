import { clickThenDismissOptionalDialog } from '../utils/dom';

class WikipediaSandboxPage {
  visit() {
    cy.visit('https://en.wikipedia.org/wiki/Wikipedia:Sandbox');
  }

  /**
   * Opens the source editor. MediaWiki occasionally shows a one-time
   * "Start editing" welcome dialog first (depends on account/cookie
   * state), so the click is routed through the shared optional-dialog
   * helper instead of assuming either outcome.
   */
  edit() {
    clickThenDismissOptionalDialog(
      '#ca-edit',
      '.oo-ui-window-content .oo-ui-buttonElement-button:contains("Start editing")',
    );
  }

  /**
   * @param {string} text
   */
  typeText(text) {
    cy.get('textarea[name="wpTextbox1"]').clear();
    cy.get('textarea[name="wpTextbox1"]').type(text, { delay: 0 });
  }

  /**
   * @param {string} [summary]
   * @param {boolean} [clickSaveButton=true] - set to false to fill the
   *   summary field without submitting, e.g. to assert on the
   *   remaining-characters counter without persisting a real edit.
   */
  saveChanges(summary, clickSaveButton = true) {
    if (summary) {
      cy.get('#wpSummary').type(summary);
    }
    if (clickSaveButton) {
      cy.get('#wpSave').click();
    }
  }

  previewChanges() {
    cy.get('#wpPreview').click();
  }

  /**
   * @param {string} summary
   */
  assertChangesSaved(summary) {
    cy.contains(summary).should('exist');
  }

  cancelEditing() {
    cy.get('#mw-editform-cancel').click();
    cy.on('window:confirm', () => true);
  }

  /**
   * @param {string} summary
   */
  assertChangesCanceled(summary) {
    cy.contains(summary).should('not.exist');
  }

  /**
   * @param {string} remaining - expected remaining-character count, as text
   */
  assertAvailableRemainingDigits(remaining) {
    // .should() polls/retries up to defaultCommandTimeout, so no fixed
    // wait is needed for the counter's async update.
    cy.get('#wpSummaryWidget .oo-ui-labelElement-label').should('have.text', remaining);
  }
}

export default WikipediaSandboxPage;
