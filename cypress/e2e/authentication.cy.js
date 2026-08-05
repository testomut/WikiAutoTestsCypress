import WikipediaAuthenticationPage from '../pages/WikipediaAuthenticationPage';

describe('Authentication', () => {
  const authPage = new WikipediaAuthenticationPage();
  const userLogin = Cypress.env('WIKI_USERNAME');
  const userPassword = Cypress.env('WIKI_PASSWORD');

  beforeEach(() => {
    authPage.visitLoginPage();
  });

  it('Successfully logs in with correct credentials', () => {
    authPage.authenticateUser({ login: userLogin, password: userPassword });
    authPage.verifySuccessfulLogin(userLogin);
  });

  it('Fails to log in with incorrect credentials', () => {
    authPage.authenticateUser({ login: 'wrongUser', password: 'wrongPassword' });
    authPage.verifyFailedLogin();
  });

  it('Fails to log in with correct username and incorrect password', () => {
    authPage.authenticateUser({ login: userLogin, password: 'wrongPassword' });
    authPage.verifyFailedLogin();
  });

  it('Successfully logs out', () => {
    authPage.authenticateUser({ login: userLogin, password: userPassword });
    authPage.clickLogoutButton();
    authPage.verifyLogout(userLogin);
  });
});
