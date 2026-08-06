import WikipediaAuthenticationPage from '../../pages/WikipediaAuthenticationPage';
import { requireEnv } from '../../utils/env';

// EXTERNAL/BLOCKED: every scenario here needs a real Wikipedia
// account, via CYPRESS_WIKI_USERNAME/CYPRESS_WIKI_PASSWORD (see
// .env.example / SECURITY.md) - moved out of the stable suite so the
// default CI workflow needs no repository secrets at all. If either
// variable is missing, requireEnv() throws a clear, specific error
// (see cypress/utils/env.js) rather than the suite silently skipping
// these scenarios.
//
// "Fails to log in with correct username and incorrect password" is
// here, not in stable/, because it's the one negative-path scenario
// that needs the real username. Wikimedia's SSO now also requires an
// emailed verification code to complete a login on this account
// (confirmed by screenshot - see FINAL_REVIEW.md), which is not
// solved or bypassed here, so the two successful-login/logout
// scenarios are expected to fail until/unless that changes.
//
// Not run in the default CI workflow; run manually via the "Cypress
// External Suite" workflow or `npm run test:external`.
describe('Authentication (external - blocked)', () => {
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
