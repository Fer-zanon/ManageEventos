import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  use: {
    channel: 'chrome',
    baseURL: 'http://127.0.0.1:4200',
    viewport: { width: 390, height: 844 },
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  },
  webServer: {
    command: 'npm start -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
