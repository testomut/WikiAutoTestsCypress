const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://en.wikipedia.org',
    pageLoadTimeout: 100000,
    defaultCommandTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
    // Scoped to CI/headless runs only, as a mitigation for the live
    // en.wikipedia.org site's own transient flakiness (not a
    // substitute for stable selectors). Interactive `cypress open`
    // runs never retry, so failures are visible immediately.
    retries: {
      runMode: 1,
      openMode: 0,
    },
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports/html',
      charts: true,
      overwrite: true,
      html: true,
      json: true,
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    setupNodeEvents(on) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
