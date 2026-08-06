import { elementExists } from '../utils/dom';

class WikipediaMainPage {
  visit() {
    cy.visit('https://en.wikipedia.org/wiki/Main_Page');
  }

  /**
   * At narrower viewports (including Cypress's default), Wikipedia's
   * Vector 2022 skin collapses the header search box behind a
   * `.search-toggle` button until it's clicked.
   *
   * `id="searchInput"` only exists on the server-rendered, pre-JS
   * markup - once the Vue-based typeahead search component hydrates
   * (which can happen mid-test), it replaces that markup with a
   * version carrying no `id`. `name="search"` is the one attribute
   * present in every state, including the standalone Special:Search
   * form, so selectors key off that instead.
   *
   * The toggle is a real link to Special:Search, meant to be
   * intercepted by Wikipedia's own JS to expand the box in place. On
   * a slow run that interception can lose the race and the click
   * falls through to a full navigation to Special:Search - a
   * different search form entirely. Both outcomes are handled here.
   * The submit button is scoped to `#p-search` because Vector 2022
   * duplicates the search form in the sticky header; an unscoped
   * selector matches both and cy.click() rejects a 2-element subject.
   *
   * @param {string} term
   */
  searchFor(term) {
    const headerInput = '#p-search input[name="search"]';
    const specialSearchPageInput = 'form#search input[name="search"]';

    cy.get('body').then(($body) => {
      const $input = $body.find(headerInput);
      if ($input.length === 0 || !$input.is(':visible')) {
        cy.get('#p-search .search-toggle').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting -- lets the toggle click's outcome (in-place expand vs. real navigation) settle before the one-shot check below.
        cy.wait(300);
      }
    });

    cy.get('body').then(($body) => {
      if ($body.find(specialSearchPageInput).length > 0) {
        cy.get(specialSearchPageInput).should('be.visible').type(term);
        cy.get(specialSearchPageInput).closest('form').submit();
      } else {
        cy.get(headerInput).should('be.visible').type(term);
        cy.get('#p-search .cdx-search-input .cdx-button').click();
      }
    });
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
   * Scoped to `#firstHeading` because Vector 2022 renders a second
   * `.mw-page-title-main` inside the sticky header's context bar for
   * the same title - an unscoped selector matches both, and
   * `have.text` would assert on their concatenated text instead
   * (e.g. 'Main PageMain Page').
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
   * The menu's open animation has no reliably queryable "done" state,
   * so a bounded wait lets it render before checking whether it
   * actually opened; if not (occasionally the first click only
   * registers a focus event), it retries once.
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
