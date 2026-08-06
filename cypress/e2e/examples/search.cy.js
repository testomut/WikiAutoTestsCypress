import WikipediaMainPage from '../../pages/WikipediaMainPage';
import { searchQueries } from '../../fixtures/testData';

describe('Article Search', () => {
  const wikipediaMainPage = new WikipediaMainPage();

  beforeEach(() => {
    wikipediaMainPage.visit();
  });

  it('Searches for an article in English', () => {
    wikipediaMainPage.searchFor(searchQueries.englishArticle);
    wikipediaMainPage.urlShouldInclude(`/wiki/${searchQueries.englishArticle}`);
    wikipediaMainPage.firstHeadingShouldContain(searchQueries.englishArticle);
  });

  it('Searches for an article in a non-English language', () => {
    wikipediaMainPage.searchFor(searchQueries.nonEnglishArticle);
    wikipediaMainPage.pageDoesNotExistMessageShouldExist();
  });

  it('Handles a very long search query', () => {
    wikipediaMainPage.searchFor(searchQueries.veryLong);
    wikipediaMainPage.searchResultsShouldExist();
  });

  it('Searches with special characters', () => {
    wikipediaMainPage.searchFor(searchQueries.specialCharacters);
    wikipediaMainPage.pageDoesNotExistMessageShouldExist();
  });

  it('Searches using numbers', () => {
    wikipediaMainPage.searchFor(searchQueries.numeric);
    wikipediaMainPage.urlShouldInclude(`/wiki/${searchQueries.numeric}`);
    wikipediaMainPage.firstHeadingShouldContain(searchQueries.numeric);
  });

  it('Searches using a mix of letters, numbers, and special characters', () => {
    wikipediaMainPage.searchFor(searchQueries.mixed);
    wikipediaMainPage.searchResultsShouldExist();
  });
});
