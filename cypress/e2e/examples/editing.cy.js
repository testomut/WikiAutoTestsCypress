import WikipediaSandboxPage from '../../pages/WikipediaSandboxPage';
import { sandboxEditText } from '../../fixtures/testData';

// Not part of the CI smoke suite - see ARCHITECTURE.md. Even "Cancels
// editing" (which never saves) can trigger Wikipedia's hCaptcha check -
// typing into the editor alone fires MediaWiki's autosave API, which
// is apparently enough to draw the same anti-abuse scrutiny as a real
// publish. Not something this project tries to solve or bypass.
describe('Sandbox Editing', () => {
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
