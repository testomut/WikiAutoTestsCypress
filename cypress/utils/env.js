/**
 * Reads a required Cypress env var via `cy.env()` rather than
 * `Cypress.env()`. Cypress 15 warns that `Cypress.env()` reads are
 * exposed to code running inside the app under test
 * (`allowCypressEnv`) and will be removed in a future major version;
 * `cy.env()` resolves in the test/driver process instead, which is
 * why credential reads live inside a hook via this helper rather than
 * at the top of a spec file.
 *
 * Throws a clear, actionable error - inside the Cypress command
 * queue, so it surfaces as a normal test failure - if the variable is
 * missing, instead of letting the suite fail later with a confusing
 * "typed undefined into a field" error.
 *
 * @param {string} name - e.g. 'WIKI_USERNAME'
 * @returns {Cypress.Chainable<string>}
 */
export function requireEnv(name) {
  // cy.env()'s Chainable command only accepts an array of keys (unlike
  // the deprecated Cypress.env(key) single-string form) - confirmed
  // against the installed Cypress type definitions, not assumed.
  return cy.env([name]).then((vars) => {
    const value = vars[name];
    if (!value) {
      throw new Error(
        `Missing required Cypress env var "${name}". Set it in a local, gitignored ` +
          `cypress.env.json (see .env.example) or as a CYPRESS_${name} environment ` +
          'variable / CI secret. See SECURITY.md.',
      );
    }
    return value;
  });
}
