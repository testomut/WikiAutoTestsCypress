import WikipediaAuthenticationPage from '../../pages/WikipediaAuthenticationPage';
import { requireEnv } from '../../utils/env';

// EXTERNAL/BLOCKED: Wikimedia's SSO now requires an emailed
// verification code to complete a login on this account (confirmed by
// screenshot - see FINAL_REVIEW.md), which is not solved or bypassed
// here. Both scenarios below depend on a successful login, so both
// are expected to fail until/unless that changes. Not run in the
// default CI workflow; run manually via the "Cypress External Suite"
// workflow or `npm run test:external`.
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
