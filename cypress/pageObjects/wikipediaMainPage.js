// Define the WikipediaMainPage class for interacting with the Wikipedia main page
class WikipediaMainPage {
    // Method to navigate to the Wikipedia main page
    visit() {
        cy.visit('https://en.wikipedia.org/wiki/Main_Page');
    }
  
    // Method to perform a search on the main page. It takes a 'term' parameter which is the search query string
    searchFor(term) {
        // Find the search input box by its ID, type the search term, and press enter to submit the search
        cy.get('#searchInput').type(term);
        // Finds the "Search" button and clicks on it to perform a search
        cy.get('.cdx-search-input .cdx-button').click();
    }
  
    // Method to check if the current URL includes a specific path
    urlShouldInclude(path) {
        // Assert that the current URL should include the specified 'path'
        cy.url().should('include', path);
    }
  
    // Method to assert that the first heading on the page should contain a specific text
    firstHeadingShouldContain(text) {
        // Find the first heading (h1) on the page and assert it contains the specified 'text'
        cy.get('h1').first().should('contain', text);
    }
  
    // Method to assert that search results exist on the page
    searchResultsShouldExist() {
        // Assert that an element with the class '.searchresults' should exist in the DOM
        cy.get('.searchresults').should('exist');
    }
  
    // Method to assert that a message indicating a page does not exist is shown
    pageDoesNotExistMessageShouldExist() {
        // Assert that a message containing "The page" exists, indicating a non-existent page
        cy.contains('The page').should('exist');
    }

    // Method to navigate to a link identified by its title attribute
    navigateByTitle(title) {
        cy.get(`a[title=${title}]`).click();
    }

    // Method to assert that the current page's title matches the expected title
    assertCorrectPageTitle(title) {
        cy.get('.mw-page-title-main').should('have.text', title);
    }

    // Method to simulate a click action on the website's logo
    clickOnLogo() {
        cy.get(`.mw-logo-container`).click();
    }

    // Method to click the 'View source' tab on a Wikipedia page
    clickOnViewSource() {
        cy.get(`#ca-viewsource`).click();
    }

    // Method to click the 'View history' tab on a Wikipedia page
    clickOnViewHistory() {
        cy.get(`#ca-history`).click();
    }
    
    // Clicks on the language link identified by the provided language code.
    switchLanguage(languageCode, selectLanguage = true) {
        // First, check if the language switch button exists in the current page context.
        cy.get('body').then(($body) => {
            // If the language switch checkbox exists, click it to open the language selection menu.
            if ($body.find("#p-lang-btn-checkbox").length !== 0) {
                cy.get(`#p-lang-btn-checkbox`).click();
                // Wait for 500ms to ensure the language selection menu is fully visible.
                cy.wait(500);
                // Re-check if the menu is actually open; if not, try clicking the checkbox again.
                cy.get('body').then(($body) => {
                    if ($body.find(".grid.uls-wide").length === 0) {
                        cy.get(`#p-lang-btn-checkbox`).click();
                    }
                });
                // Clear any existing input in the language search box and type the desired language code.
                cy.get(`#search input`).last().clear().type(languageCode);
            }
        });
        // If the selectLanguage flag is true, proceed to click on the language link to switch languages.
        if(selectLanguage) {
            // A special case for 'de' (German) due to potentially multiple links; otherwise, click the first found link for the specified language.
            if(languageCode !== 'de') {
                cy.get(`[lang="${languageCode}"]`).first().click();
            } else {
                cy.get(`[lang="${languageCode}"]`).eq(1).click();
            } 
        }
    }
 
    // Asserts that a message indicating the article doesn't exist is present on the page.
    verifyArticleDoesNotExist() {
        cy.contains('This page is not available in the language you searched for.').should('exist');
    }
}
  
// Export the WikipediaMainPage class as the default export of the module
export default WikipediaMainPage;
  