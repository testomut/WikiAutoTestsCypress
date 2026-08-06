import WikipediaAuthenticationPage from '../../pages/WikipediaAuthenticationPage';
import { requireEnv } from '../../utils/env';

// Not part of the CI smoke suite - see ARCHITECTURE.md. The successful
// login/logout scenarios currently fail because Wikipedia's SSO now
// asks for an emailed verification code, which isn't handled here.
// Needs CYPRESS_WIKI_USERNAME/CYPRESS_WIKI_PASSWORD - see .env.example.
describe('Authentication', () => {
  const authPage = new WikipediaAuthenticationPage();
  let credentials = {};

  before(() => {
    requireEnv('WIKI_USERNAME').then((login) => {
      credentials.login = login;
    });
    requireEnv('WIKI_PASSWORD').then((password) => {
      credentials.password = password;
    });
  });

  beforeEach(() => {
    authPage.visitLoginPage();
  });

  it('Fails to log in with incorrect credentials', () => {
    authPage.authenticateUser({ login: 'wrongUser', password: 'wrongPassword' });
    authPage.verifyFailedLogin();
  });

  it('Fails to log in with correct username and incorrect password', () => {
    authPage.authenticateUser({ login: credentials.login, password: 'wrongPassword' });
    authPage.verifyFailedLogin();
  });

  it('Successfully logs in with correct credentials', () => {
    authPage.authenticateUser(credentials);
    authPage.verifySuccessfulLogin(credentials.login);
  });

  it('Successfully logs out', () => {
    authPage.authenticateUser(credentials);
    authPage.clickLogoutButton();
    authPage.verifyLogout(credentials.login);
  });
});
