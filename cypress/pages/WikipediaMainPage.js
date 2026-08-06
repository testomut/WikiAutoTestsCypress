import { elementExists } from '../utils/dom';

class WikipediaMainPage {
  visit() {
    cy.visit('https://en.wikipedia.org/wiki/Main_Page');
  }

  /**
   * At narrower viewports (including Cypress's default), Wikipedia's
   * Vector 2022 skin renders the header search box collapsed behind a
   * `.search-toggle` icon button until that toggle is clicked.
   *
   * `id="searchInput"` is *not* a reliable way to find the input in
   * either state: it only exists on the server-rendered, pre-JS
   * markup. Once Wikipedia's Vue-based typeahead search component
   * hydrates - which can happen at any point after page load,
   * including mid-test - it fully replaces that markup with its own
   * interactive version that carries no `id` at all. `name="search"`
   * is the one attribute present on the input in every state (static,
   * Vue-hydrated, and the dedicated Special:Search page's own,
   * unrelated form). Confirmed by dumping the actual post-click DOM
   * via a throwaway diagnostic spec - not assumed - after this exact
   * `id`-based approach caused real, reproducible failures both in CI
   * and locally.
   *
   * The toggle is a real `<a href="/wiki/Special:Search">` styled as
   * a button, meant to be intercepted by Wikipedia's own client-side
   * JS to expand the box in place; confirmed via a real CI failure
   * that this interception can lose the race against the click on a
   * slower runner, in which case the click falls through to a full
   * page navigation to Special:Search instead - landing on a
   * completely different, dedicated search form (MediaWiki's own
   * `mw.widgets.SearchInputWidget`, `form#search`). Both outcomes are
   * handled here rather than assumed away, since which one happens
   * isn't controllable from the test. The submit button is scoped to
   * `#p-search` because Vector 2022 duplicates the whole search form
   * in the sticky header; an unscoped selector matches both and
   * cy.click() rejects a 2-element subject.
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
        // eslint-disable-next-line cypress/no-unnecessary-waiting -- gives the toggle click's outcome (in-place expand vs. real navigation) time to settle before the one-shot check below; confirmed necessary by a real CI failure caught mid-transition.
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
