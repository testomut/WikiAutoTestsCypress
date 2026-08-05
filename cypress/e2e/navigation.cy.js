import WikipediaMainPage from '../pages/WikipediaMainPage';
import { navigationTargets } from '../fixtures/testData';

describe('Category Navigation', () => {
  const wikipediaMainPage = new WikipediaMainPage();

  beforeEach(() => {
    wikipediaMainPage.visit();
  });

  it('Navigate to Wikipedia from the homepage', () => {
    wikipediaMainPage.navigateByTitle(navigationTargets.wikipediaAboutLink);
    wikipediaMainPage.urlShouldInclude(`/wiki/${navigationTargets.wikipediaAboutLink}`);
    wikipediaMainPage.assertCorrectPageTitle(navigationTargets.wikipediaAboutLink);
  });

  it('Navigate to the Home page by the logo link', () => {
    wikipediaMainPage.clickOnLogo();
    wikipediaMainPage.urlShouldInclude('/wiki/Main_Page');
    wikipediaMainPage.assertCorrectPageTitle(navigationTargets.mainPageTitle);
  });

  it('Navigate to View source for Main Page from the homepage', () => {
    wikipediaMainPage.clickOnViewSource();
    wikipediaMainPage.urlShouldInclude('title=Main_Page&action=edit');
    wikipediaMainPage.clickOnLogo();
  });

  it('Navigate to Main Page: Revision history from the homepage', () => {
    wikipediaMainPage.clickOnViewHistory();
    wikipediaMainPage.urlShouldInclude('title=Main_Page&action=history');
    wikipediaMainPage.clickOnLogo();
  });
});
