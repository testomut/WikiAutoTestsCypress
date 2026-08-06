class WikipediaAuthenticationPage {
  visitLoginPage() {
    cy.visit('https://en.wikipedia.org/wiki/Main_Page');
    cy.clearAllCookies();
    cy.visit('https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page');
  }

  /**
   * The login form redirects to Wikimedia's centralized SSO domain
   * (auth.wikimedia.org) rather than authenticating on
   * en.wikipedia.org directly, so this needs `cy.origin()` to keep
   * driving commands across that navigation. A successful login
   * redirects back to en.wikipedia.org afterwards, so callers don't
   * need `cy.origin()` themselves.
   *
   * @param {{ login: string, password: string }} credentials
   */
  authenticateUser({ login, password }) {
    cy.origin(
      'https://auth.wikimedia.org',
      { args: { login, password } },
      ({ login, password }) => {
        cy.get('#wpName1').type(login);
        cy.get('#wpPassword1').type(password);
        cy.get('#wpLoginAttempt').click();
      },
    );
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

  /**
   * A failed login stays on auth.wikimedia.org, so this assertion
   * runs inside the same cy.origin() boundary as authenticateUser().
   */
  verifyFailedLogin() {
    cy.origin('https://auth.wikimedia.org', () => {
      cy.url().should('include', 'Special:UserLogin');
      cy.contains('Incorrect username or password entered.').should('exist');
    });
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
