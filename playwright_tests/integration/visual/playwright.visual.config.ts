import { defineConfig, devices } from '@playwright/test';

const candidateUrl = process.env.TEST_URL?.trim();
if (!candidateUrl || !/^http:\/\/(?:127\.0\.0\.1|localhost):\d+\/?$/.test(candidateUrl)) {
  throw new Error('Visual comparison requires TEST_URL=http://127.0.0.1:<port> for an identified local candidate build');
}
const candidateSha = process.env.VISUAL_CANDIDATE_SHA?.trim();
if (!candidateSha) {
  throw new Error('Visual comparison requires VISUAL_CANDIDATE_SHA for candidate provenance');
}
if (process.platform !== 'darwin') {
  throw new Error('Visual comparison is currently approved only on macOS until Linux baselines are supplied');
}

// Opt-in local comparison only; the functional CI configs do not discover this suite.
export default defineConfig({
  metadata: {
    visualCandidateSha: candidateSha,
    visualCandidateUrl: candidateUrl,
    visualPlatform: 'darwin-only'
  },
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
