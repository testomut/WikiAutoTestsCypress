import WikipediaMainPage from '../../pages/WikipediaMainPage';
import { languageCodes } from '../../fixtures/testData';

// Not part of the CI smoke suite - see ARCHITECTURE.md. These currently
// fail: Wikipedia's language selector widget doesn't match the
// selectors switchLanguage() expects after clicking the toggle, and
// I haven't dug into the live DOM to find the current markup.
describe('Change Language Functionality', () => {
  const wikipediaMainPage = new WikipediaMainPage();

  beforeEach(() => {
    wikipediaMainPage.visit();
  });

  it('Switch to a language with a full version of the article', () => {
    wikipediaMainPage.switchLanguage(languageCodes.spanish);
    wikipediaMainPage.urlShouldInclude(languageCodes.spanish);
  });

  it('Switch to a language where the article does not exist', () => {
    wikipediaMainPage.switchLanguage(languageCodes.welshNoArticle, false);
    wikipediaMainPage.verifyArticleDoesNotExist();
  });

  it('Verify articles availability in most popular languages', () => {
    wikipediaMainPage.switchLanguage(languageCodes.english);
    wikipediaMainPage.urlShouldInclude(languageCodes.english);

    wikipediaMainPage.switchLanguage(languageCodes.german);
    wikipediaMainPage.urlShouldInclude(languageCodes.german);

    wikipediaMainPage.switchLanguage(languageCodes.french);
    wikipediaMainPage.urlShouldInclude(languageCodes.french);
  });

  it('Switch to a language and switch back to check if the original context is preserved', () => {
    wikipediaMainPage.switchLanguage(languageCodes.english);
    wikipediaMainPage.urlShouldInclude(languageCodes.english);

    wikipediaMainPage.switchLanguage(languageCodes.french);
    wikipediaMainPage.urlShouldInclude(languageCodes.french);

    wikipediaMainPage.switchLanguage(languageCodes.english);
    wikipediaMainPage.urlShouldInclude(languageCodes.english);
  });
});
