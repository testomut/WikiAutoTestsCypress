class WikipediaAuthenticationPage {
    // Navigate to the login page
    visitLoginPage() {
        cy.visit('https://en.wikipedia.org/wiki/Main_Page');
        cy.clearAllCookies();
        cy.visit('https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page');
    }

    // Authenticate a user with login and password
    authenticateUser({ login, password }) {
        cy.get('#wpName1').type(login);
        cy.get('#wpPassword1').type(password);
        cy.get('#wpLoginAttempt').click();
    }

    // Click the logout button
    clickLogoutButton() {
        cy.get('#vector-user-links-dropdown-checkbox').click();
        cy.get('#pt-logout').click();
    }

    // Verify successful login by checking for a user-specific element
    verifySuccessfulLogin(username) {
        cy.contains(username).should('exist');
        cy.get('#vector-user-links-dropdown-checkbox').should('exist');
    }

    // Verify login failure by checking for an error message
    verifyFailedLogin() {
        cy.contains('Incorrect username or password entered.').should('exist');
    }

    // Verify successful logout by checking for the login page
    verifyLogout() {
        cy.url().should('include', 'title=Special:UserLogout');
        cy.contains('Log in').should('exist');
    }

    // Verify the presence of the user profile link
    verifyUserProfileLink() {
        cy.get('#userProfileLink').should('exist');
    }
}

export default WikipediaAuthenticationPage;
