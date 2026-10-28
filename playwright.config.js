const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/tests',
  testMatch: /.*\.spec\.js/,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    channel: 'msedge',
    headless: true,
  },
});
