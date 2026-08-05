class WikipediaAuthenticationPage {
  visitLoginPage() {
    cy.visit('https://en.wikipedia.org/wiki/Main_Page');
    cy.clearAllCookies();
    cy.visit('https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page');
  }

  /**
   * @param {{ login: string, password: string }} credentials
   */
  authenticateUser({ login, password }) {
    cy.get('#wpName1').type(login);
    cy.get('#wpPassword1').type(password);
    cy.get('#wpLoginAttempt').click();
  }

  clickLogoutButton() {
    cy.get('#vector-user-links-dropdown-checkbox').click();
    cy.get('#pt-logout').click();
  }

  /**
   * @param {string} username
   */
  verifySuccessfulLogin(username) {
    cy.contains(username).should('exist');
    cy.get('#vector-user-links-dropdown-checkbox').should('exist');
  }

  verifyFailedLogin() {
    cy.contains('Incorrect username or password entered.').should('exist');
  }

  /**
   * @param {string} username - asserts the username no longer appears
   *   in the page chrome after logout, in addition to the generic
   *   "Log in" link being present.
   */
  verifyLogout(username) {
    cy.url().should('include', 'title=Special:UserLogout');
    cy.contains('Log in').should('exist');
    if (username) {
      cy.contains(username).should('not.exist');
    }
  }
}

export default WikipediaAuthenticationPage;
