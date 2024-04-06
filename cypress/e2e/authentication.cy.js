import WikipediaAuthenticationPage from '../pageObjects/WikipediaAuthenticationPage';

describe('Oauth Functionality', () => {
    const authPage = new WikipediaAuthenticationPage();
    const userLogin = Cypress.env('username');
    const userPassword = Cypress.env('password');

    beforeEach(() => {
        authPage.visitLoginPage();
    });

    it('Successfully logs in with correct credentials', () => {
        authPage.authenticateUser({
            login: userLogin,
            password: userPassword
        });
        // Verify the user is logged in by checking for a user-specific element
        authPage.verifySuccessfulLogin(userLogin);
    });

    it('Fails to log in with incorrect credentials', () => {
        authPage.authenticateUser({
            login: 'wrongUser',
            password: 'wrongPassword'
        });
        // Verify login failed by checking for an error message
        authPage.verifyFailedLogin();
    });

    it('Fails to log in with correct username and incorrect password', () => {
        authPage.authenticateUser({
            login: userLogin,
            password: 'wrongPassword'
        });
        // Verify that elements specific to logged-in users are present
        authPage.verifyFailedLogin();
    });

    it('Successfully logs out', () => {
        authPage.authenticateUser({
            login: userLogin,
            password: userPassword
        });
        authPage.clickLogoutButton();
        // Verify the user is logged out by checking for the login page
        authPage.verifyLogout(userLogin);
    });
});
