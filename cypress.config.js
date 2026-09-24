const { defineConfig } = require('cypress');

module.exports = defineConfig({
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
  },
});
