import WikipediaAuthenticationPage from '../../pages/WikipediaAuthenticationPage';
import { requireEnv } from '../../utils/env';

// STABLE: these two negative-path scenarios don't depend on Wikimedia's
// SSO email-verification step (see cypress/e2e/external/authentication.cy.js),
// so they run reliably in the default CI suite. The "wrong password" case
// still needs the real username - read via requireEnv(), not a top-level
// Cypress.env() call - see cypress/utils/env.js for why.
describe('Authentication (stable)', () => {
  const authPage = new WikipediaAuthenticationPage();
  let realUsername;

  before(() => {
    requireEnv('WIKI_USERNAME').then((login) => {
      realUsername = login;
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
    authPage.authenticateUser({ login: realUsername, password: 'wrongPassword' });
    authPage.verifyFailedLogin();
  });
});
