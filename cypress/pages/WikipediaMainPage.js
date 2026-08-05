import { elementExists } from '../utils/dom';

class WikipediaMainPage {
  visit() {
    cy.visit('https://en.wikipedia.org/wiki/Main_Page');
  }

  /**
   * At narrower viewports (including Cypress's default), Wikipedia's
   * Vector 2022 skin renders the header search box collapsed behind a
   * `.search-toggle` icon button — the real `#searchInput` exists in
   * the DOM but its container is `display: none` until that toggle is
   * clicked. Vector 2022 also duplicates the whole search form in the
   * sticky header, so the submit button is scoped to `#p-search`
   * (the primary header's form); an unscoped selector matches both
   * forms and cy.click() rejects a 2-element subject. Neither of
   * these was the case when this suite was first written - both
   * verified against the live markup while diagnosing real failures,
   * not assumed.
   *
   * @param {string} term
   */
  searchFor(term) {
    cy.get('#searchInput').then(($input) => {
      if (!$input.is(':visible')) {
        cy.get('#p-search .search-toggle').click();
      }
    });
    cy.get('#searchInput').should('be.visible').type(term);
    cy.get('#p-search .cdx-search-input .cdx-button').click();
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
   * Scoped to `#firstHeading` because Vector 2022 now renders a second
   * `.mw-page-title-main` inside the sticky header's context bar for
   * the same page title — an unscoped selector matches both and
   * `have.text` then asserts on their concatenated text (e.g.
   * 'Main PageMain Page'). Verified against the live markup while
   * diagnosing a real test failure, not assumed.
   *
   * @param {string} title
   */
  assertCorrectPageTitle(title) {
    cy.get('#firstHeading .mw-page-title-main').should('have.text', title);
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
      // eslint-disable-next-line cypress/no-unnecessary-waiting -- see method docblock above: no queryable "menu finished opening" state exists.
      cy.wait(500);

      elementExists('.grid.uls-wide').then((menuOpen) => {
        if (!menuOpen) {
          cy.get('#p-lang-btn-checkbox').click();
        }
      });

      cy.get('#search input').last().clear();
      cy.get('#search input').last().type(languageCode);
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
