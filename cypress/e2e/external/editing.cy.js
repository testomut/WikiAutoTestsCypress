import WikipediaSandboxPage from '../../pages/WikipediaSandboxPage';
import { sandboxEditText } from '../../fixtures/testData';

// EXTERNAL/BLOCKED: every scenario here can trigger an hCaptcha
// challenge - not just the ones that submit a save. Confirmed via a
// real CI run: "Cancels editing an article" (which only types and
// cancels, never saves) still triggered network calls to
// hcaptcha.wikimedia.org and /rest.php/v0/confirmedit/hcaptcha/*,
// visible in that run's screenshot - almost certainly because typing
// into the editor alone triggers MediaWiki's stashedit autosave API,
// which is enough to draw the same anti-abuse scrutiny as an actual
// publish. That challenge is not solved or bypassed here, and appears
// to gate the rest of that browser session once triggered. Not run in
// the default CI workflow; run manually via the "Cypress External
// Suite" workflow or `npm run test:external`.
describe('Sandbox Editing (external - blocked)', () => {
  const sandboxPage = new WikipediaSandboxPage();
  // Unique per run so repeated executions against the shared, real
  // Wikipedia:Sandbox page don't collide with a prior run's leftover text.
  const uniqueText = `Test ${Date.now()}`;

  beforeEach(() => {
    sandboxPage.visit();
    sandboxPage.edit();
  });

  it('Cancels editing an article', () => {
    sandboxPage.typeText(sandboxEditText.cancelled);
    sandboxPage.cancelEditing();
    sandboxPage.assertChangesCanceled(sandboxEditText.cancelled);
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
