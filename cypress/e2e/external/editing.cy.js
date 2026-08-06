import WikipediaSandboxPage from '../../pages/WikipediaSandboxPage';
import { sandboxEditText } from '../../fixtures/testData';

// EXTERNAL/BLOCKED: every scenario here submits a save. On this test
// account, the first save attempt in a run triggers an hCaptcha
// challenge (confirmed via the Cypress network log - see
// FINAL_REVIEW.md), which is not solved or bypassed here, and appears
// to gate the rest of that browser session. Not run in the default CI
// workflow; run manually via the "Cypress External Suite" workflow or
// `npm run test:external`.
describe('Sandbox Editing (external - blocked)', () => {
  const sandboxPage = new WikipediaSandboxPage();
  // Unique per run so repeated executions against the shared, real
  // Wikipedia:Sandbox page don't collide with a prior run's leftover text.
  const uniqueText = `Test ${Date.now()}`;

  beforeEach(() => {
    sandboxPage.visit();
    sandboxPage.edit();
  });

  it('Edits the sandbox by adding text with characters', () => {
    sandboxPage.typeText(sandboxEditText.withCharacters);
    sandboxPage.saveChanges(sandboxEditText.editSummary);
    sandboxPage.assertChangesSaved(sandboxEditText.withCharacters);
  });

  it('Edits the sandbox by adding text with numbers', () => {
    sandboxPage.typeText(sandboxEditText.numeric);
    sandboxPage.saveChanges(sandboxEditText.editSummary);
    sandboxPage.assertChangesSaved(sandboxEditText.numeric);
  });

  it('Edits the sandbox by adding text with special symbols', () => {
    sandboxPage.typeText(sandboxEditText.specialCharacters);
    sandboxPage.saveChanges(sandboxEditText.editSummary);
    sandboxPage.assertChangesSaved(sandboxEditText.specialCharacters);
  });

  it('Edits the sandbox without summary', () => {
    sandboxPage.typeText(uniqueText);
    sandboxPage.saveChanges();
    sandboxPage.assertChangesSaved(uniqueText);
  });

  it('Check maximum text length for summary', () => {
    // clickSaveButton=false: we only want the counter to update, not
    // publish a real edit to the shared sandbox page.
    sandboxPage.saveChanges(sandboxEditText.longSummary, false);
    sandboxPage.assertAvailableRemainingDigits(sandboxEditText.remainingCharsAfterLongSummary);
  });
});
