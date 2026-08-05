import WikipediaSandboxPage from '../../pages/WikipediaSandboxPage';
import { sandboxEditText } from '../../fixtures/testData';

// STABLE: this is the one editing.cy.js scenario that never submits a
// save, so it doesn't trigger the hCaptcha challenge described in
// cypress/e2e/external/editing.cy.js. Kept in the default CI suite.
describe('Sandbox Editing (stable)', () => {
  const sandboxPage = new WikipediaSandboxPage();

  beforeEach(() => {
    sandboxPage.visit();
    sandboxPage.edit();
  });

  it('Cancels editing an article', () => {
    sandboxPage.typeText(sandboxEditText.cancelled);
    sandboxPage.cancelEditing();
    sandboxPage.assertChangesCanceled(sandboxEditText.cancelled);
  });
});
