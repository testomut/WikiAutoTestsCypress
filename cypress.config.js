const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://en.wikipedia.org",
    pageLoadTimeout: 100000,
    defaultCommandTimeout: 10000,
    video: true,
    setupNodeEvents(on, config) {
      
    },
    reporter: 'cypress-mochawesome-reporter',
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'mochawesome',
      mochawesomeReporterOptions: {
        reportDir: 'cypress/reports/mocha',
        quite: true,
        overwrite: false,
        html: false,
        json: true,
      },
    },
  },
});
