import { elementExists } from '../utils/dom';

class WikipediaMainPage {
  visit() {
    cy.visit('https://en.wikipedia.org/wiki/Main_Page');
  }

  /**
   * @param {string} term
   */
  searchFor(term) {
    cy.get('#searchInput').type(term);
    cy.get('.cdx-search-input .cdx-button').click();
  }

  /**
   * @param {string} path
   */
  urlShouldInclude(path) {
    cy.url().should('include', path);
  }

  /**
   * @param {string} text
   */
  firstHeadingShouldContain(text) {
    cy.get('h1').first().should('contain', text);
  }

  searchResultsShouldExist() {
    cy.get('.searchresults').should('exist');
  }

  pageDoesNotExistMessageShouldExist() {
    cy.contains('The page').should('exist');
  }

  /**
   * @param {string} title
   */
  navigateByTitle(title) {
    cy.get(`a[title="${title}"]`).click();
  }

  /**
   * @param {string} title
   */
  assertCorrectPageTitle(title) {
    cy.get('.mw-page-title-main').should('have.text', title);
  }

  clickOnLogo() {
    cy.get('.mw-logo-container').click();
  }

  clickOnViewSource() {
    cy.get('#ca-viewsource').click();
  }

  clickOnViewHistory() {
    cy.get('#ca-history').click();
  }

  /**
   * Switches the active article language via the language menu.
   *
   * The menu open animation gives no reliably queryable "done" state,
   * so a single bounded wait is used to let it render before checking
   * whether it actually opened; if not (occasionally the first click
   * only registers a focus event), it retries once. This is a
   * documented tradeoff, not a hidden flaky-test workaround — see
   * ARCHITECTURE.md "Stability strategy".
   *
   * @param {string} languageCode - e.g. 'en', 'de', 'fr', 'es', 'cy'
   * @param {boolean} [selectLanguage=true] - false to open the menu and
   *   type the query without clicking a result (e.g. to assert the
   *   language isn't offered at all)
   */
  switchLanguage(languageCode, selectLanguage = true) {
    elementExists('#p-lang-btn-checkbox').then((exists) => {
      if (!exists) return;

      cy.get('#p-lang-btn-checkbox').click();
      cy.wait(500);

      elementExists('.grid.uls-wide').then((menuOpen) => {
        if (!menuOpen) {
          cy.get('#p-lang-btn-checkbox').click();
        }
      });

      cy.get('#search input').last().clear().type(languageCode);
    });

    if (selectLanguage) {
      // German ('de') matches more than one link in the menu; the
      // first is the correct one for every other language checked.
      const linkIndex = languageCode === 'de' ? 1 : 0;
      cy.get(`[lang="${languageCode}"]`).eq(linkIndex).click();
    }
  }

  verifyArticleDoesNotExist() {
    cy.contains('This page is not available in the language you searched for.').should('exist');
  }
}

export default WikipediaMainPage;
