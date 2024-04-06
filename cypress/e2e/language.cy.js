import WikipediaMainPage from '../pageObjects/wikipediaMainPage';

describe('Change Language Functionality', () => {
    const wikipediaMainPage = new WikipediaMainPage();

    beforeEach(() => {
        wikipediaMainPage.visit();
    });

    it('Switch to a language with a full version of the article', () => {
        // Spanish
        wikipediaMainPage.switchLanguage('es');
        wikipediaMainPage.urlShouldInclude('es');
    });

    it('Switch to a language where the article does not exist', () => {
        // Welsh
        wikipediaMainPage.switchLanguage('cy', false);
        wikipediaMainPage.verifyArticleDoesNotExist();
    });

    it('Verify articles availability in most popular languages', () => {
        // English
        wikipediaMainPage.switchLanguage('en');
        wikipediaMainPage.urlShouldInclude('en');
    
        // German
        wikipediaMainPage.switchLanguage('de');
        wikipediaMainPage.urlShouldInclude('de');
    
        // French
        wikipediaMainPage.switchLanguage('fr');
        wikipediaMainPage.urlShouldInclude('fr');
    });

    it('Switch to a language and switch back to check if the original context is preserved', () => {
        // English
        wikipediaMainPage.switchLanguage('en');
        wikipediaMainPage.urlShouldInclude('en');

        // French
        wikipediaMainPage.switchLanguage('fr');
        wikipediaMainPage.urlShouldInclude('fr');

        // returns to English
        wikipediaMainPage.switchLanguage('en');
        wikipediaMainPage.urlShouldInclude('en');
    });
});