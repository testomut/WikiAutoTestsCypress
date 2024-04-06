import WikipediaMainPage from '../pageObjects/wikipediaMainPage';

describe('Article Search', () => {
  const wikipediaMainPage = new WikipediaMainPage();

  beforeEach(() => {
    wikipediaMainPage.visit();
  });

  it('Searches for an article in English', () => {
    wikipediaMainPage.searchFor('Cat');
    wikipediaMainPage.urlShouldInclude('/wiki/Cat');
    wikipediaMainPage.firstHeadingShouldContain('Cat');
  });

  it('Searches for an article in a non-English language', () => {
    wikipediaMainPage.searchFor('Кот');
    wikipediaMainPage.pageDoesNotExistMessageShouldExist();
  });

  it('Handles a very long search query', () => {
    const longQuery = 'a'.repeat(300);
    wikipediaMainPage.searchFor(longQuery);
    wikipediaMainPage.searchResultsShouldExist();
  });

  it('Searches with special characters', () => {
    wikipediaMainPage.searchFor('%^&*');
    wikipediaMainPage.pageDoesNotExistMessageShouldExist();
  });

  it('Searches using numbers', () => {
    wikipediaMainPage.searchFor('12345');
    wikipediaMainPage.urlShouldInclude('/wiki/12345');
    wikipediaMainPage.firstHeadingShouldContain('12345');
  });

  it('Searches using a mix of letters, numbers, and special characters', () => {
    wikipediaMainPage.searchFor('Cats 123!@');
    wikipediaMainPage.searchResultsShouldExist();
  });
});
