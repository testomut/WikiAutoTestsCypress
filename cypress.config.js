const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://en.wikipedia.org',
    pageLoadTimeout: 100000,
    defaultCommandTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
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
