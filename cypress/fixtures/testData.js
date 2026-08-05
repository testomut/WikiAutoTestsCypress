/**
 * Static test data shared across specs, kept separate from test logic
 * so scenarios can be extended without touching page objects or specs.
 */

export const searchQueries = {
  englishArticle: 'Cat',
  nonEnglishArticle: 'Кот',
  numeric: '12345',
  specialCharacters: '%^&*',
  mixed: 'Cats 123!@',
  veryLong: 'a'.repeat(300),
};

export const languageCodes = {
  english: 'en',
  spanish: 'es',
  german: 'de',
  french: 'fr',
  welshNoArticle: 'cy',
};

export const sandboxEditText = {
  withCharacters: 'Saved TexT',
  cancelled: 'Test Cancel',
  numeric: '1234567890',
  specialCharacters: `&<>"'=`,
  editSummary: 'Cypress test: summary text',
  longSummary: 'abqwertyui'.repeat(45),
  remainingCharsAfterLongSummary: '50',
};

export const navigationTargets = {
  wikipediaAboutLink: 'Wikipedia',
  mainPageTitle: 'Main Page',
};
