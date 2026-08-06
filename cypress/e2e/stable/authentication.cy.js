import WikipediaAuthenticationPage from '../../pages/WikipediaAuthenticationPage';

// STABLE: no Wikipedia credentials required. This scenario uses only
// fake login/password literals, so it needs no secret and doesn't
// depend on Wikimedia's SSO email-verification step (see
// cypress/e2e/external/authentication.cy.js for the scenarios that
// do need a real account). Runs in the default, secret-free CI suite.
describe('Authentication (stable)', () => {
  const authPage = new WikipediaAuthenticationPage();

  beforeEach(() => {
    authPage.visitLoginPage();
  });

  it('Fails to log in with incorrect credentials', () => {
    authPage.authenticateUser({ login: 'wrongUser', password: 'wrongPassword' });
    authPage.verifyFailedLogin();
  });
});
