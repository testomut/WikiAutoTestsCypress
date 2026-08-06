import WikipediaAuthenticationPage from '../../pages/WikipediaAuthenticationPage';
import { requireEnv } from '../../utils/env';

// Reference example, not part of the CI smoke suite (see ARCHITECTURE.md).
// The two successful-login/logout scenarios currently fail: Wikimedia's
// SSO requires an emailed verification code to complete a login on this
// account, which this project does not attempt to solve or bypass.
// Run manually via `npm run test:examples` or the "Cypress Examples"
// workflow. Needs CYPRESS_WIKI_USERNAME/CYPRESS_WIKI_PASSWORD - see
// .env.example / SECURITY.md; requireEnv() throws a clear error rather
// than silently skipping if either is missing.
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
