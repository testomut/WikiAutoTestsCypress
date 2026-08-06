/**
 * Reads a required Cypress env var via `cy.env()` instead of the
 * deprecated `Cypress.env()` (which is exposed to code running inside
 * the app under test). Throws a clear error if the variable is
 * missing instead of letting the test fail later with a confusing
 * "typed undefined into a field" error.
 *
 * @param {string} name - e.g. 'WIKI_USERNAME'
 * @returns {Cypress.Chainable<string>}
 */
export function requireEnv(name) {
  // cy.env() only accepts an array of keys, unlike Cypress.env(key).
  return cy.env([name]).then((vars) => {
    const value = vars[name];
    if (!value) {
      throw new Error(
        `Missing required Cypress env var "${name}". Set it in a local, gitignored ` +
          `cypress.env.json (see .env.example) or as a CYPRESS_${name} environment variable.`,
      );
    }
    return value;
  });
}
