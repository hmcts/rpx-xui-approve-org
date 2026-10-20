import { defineConfig, devices } from '@playwright/test';

const candidateUrl = process.env.TEST_URL?.trim();
if (!candidateUrl || !/^http:\/\/(?:127\.0\.0\.1|localhost):\d+\/?$/.test(candidateUrl)) {
  throw new Error('Visual comparison requires TEST_URL=http://127.0.0.1:<port> for an identified local candidate build');
}

// Opt-in local comparison only; the functional CI configs do not discover this suite.
export default defineConfig({
  testDir: '.',
  testMatch: /.*\.visual\.spec\.ts/,
  outputDir: '../../../functional-output/tests/playwright-visual/test-results',
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: '../../../functional-output/tests/playwright-visual/html-report', open: 'never' }]],
  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      channel: 'chrome',
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
      locale: 'en-GB',
      timezoneId: 'Europe/London',
      colorScheme: 'light',
      reducedMotion: 'reduce',
      trace: 'retain-on-failure'
    }
  }]
});
