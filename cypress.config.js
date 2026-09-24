const fs = require('fs');
const { defineConfig } = require('cypress');

const resultsFolder = 'cypress/results';

module.exports = defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      // One file per spec: without [hash] every spec would overwrite the previous one.
      mochaFile: `${resultsFolder}/junit-[hash].xml`,
      testsuitesTitle: 'Cypress Tests',
    },
  },
  e2e: {
    baseUrl: 'https://front.serverest.dev',
    expose: {
      apiUrl: 'https://serverest.dev',
    },
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
    // A single CI retry surfaces flakiness in the report without hiding a consistent failure.
    retries: { runMode: 1, openMode: 0 },
    setupNodeEvents(on) {
      // Stale XML from a previous run would be published as if it belonged to this one.
      on('before:run', () => fs.rmSync(resultsFolder, { recursive: true, force: true }));
    },
  },
});
