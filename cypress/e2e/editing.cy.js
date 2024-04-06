import WikipediaSandboxPage from '../pageObjects/WikipediaSandboxPage';

describe('Sandbox Editing', () => {
  const sandboxPage = new WikipediaSandboxPage();
  const uniqueText = `Test ${Date.now()}`; // Generate unique text for each test run
  const editSummary = 'Cypress test: summary text';
  const textWith450Symbols = 'abqwertyui'.repeat(45);

  beforeEach(() => {
    sandboxPage.visit();
    sandboxPage.edit();
  });

  it('Edits the sandbox by adding text with characters', () => {
    sandboxPage.typeText('Saved TexT');
    sandboxPage.saveChanges(editSummary);
    sandboxPage.assertChangesSaved('Saved TexT');
  });

  it('Cancels editing an article', () => {
    sandboxPage.typeText('Test Cancel');
    sandboxPage.cancelEditing();
    sandboxPage.assertChangesCanceled('Test Cancel');
  });

  it('Edits the sandbox by adding text with numbers', () => {
    sandboxPage.typeText(`1234567890`);
    sandboxPage.saveChanges(editSummary);
    sandboxPage.assertChangesSaved(`1234567890`);
  });

  it('Edits the sandbox by adding text with special symbols', () => {
    sandboxPage.typeText(`&<>"'=`);
    sandboxPage.saveChanges(editSummary);
    sandboxPage.assertChangesSaved(`&<>"'=`);
  });

  it('Edits the sandbox without summary', () => {
    sandboxPage.typeText(uniqueText);
    sandboxPage.saveChanges();
    sandboxPage.assertChangesSaved(uniqueText);
  });

  it('Check maximum text length for summary', () => {
    // We don't want to push to "Publish changes" button, that's why we type false in the second argument
    sandboxPage.saveChanges(textWith450Symbols, false);
    
    sandboxPage.assertAvailableRemainingDigits('50');
  });
});
