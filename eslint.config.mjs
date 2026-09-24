import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import pluginCypress from 'eslint-plugin-cypress';
import pluginMocha from 'eslint-plugin-mocha';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig([
  {
    ignores: [
      'node_modules/',
      'cypress/screenshots/',
      'cypress/videos/',
      'cypress/downloads/',
      'docs/evidence/',
    ],
  },
  js.configs.recommended,
  {
    files: ['cypress/**/*.js'],
    extends: [pluginCypress.configs.recommended],
    languageOptions: { sourceType: 'module' },
  },
  {
    files: ['cypress/e2e/**/*.cy.js'],
    plugins: { mocha: pluginMocha },
    rules: {
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-identical-title': 'error',
    },
  },
  {
    files: ['cypress.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    files: ['eslint.config.mjs'],
    languageOptions: { globals: globals.node },
  },
  prettierConfig,
]);
