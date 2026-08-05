const js = require('@eslint/js');
const cypressPlugin = require('eslint-plugin-cypress');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'cypress/reports/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
      'docs/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['*.js', 'cypress/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ...cypressPlugin.configs.recommended,
    files: ['cypress/**/*.js'],
  },
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  eslintConfigPrettier,
];
