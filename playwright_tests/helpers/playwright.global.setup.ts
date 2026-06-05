import type { FullConfig } from '@playwright/test';
import { sessionCapture } from './sessionCapture';

async function globalSetup(fullConfig: FullConfig): Promise<void> {
  if ((process.env.PW_SKIP_SESSION_CAPTURE ?? '').toLowerCase() === 'true') {
    console.log('[playwright-session] Skipping global setup session capture (PW_SKIP_SESSION_CAPTURE=true)');
    return;
  }

  const configFilePath = fullConfig.configFile?.toLowerCase() ?? '';
  const isAccessibilityRun = configFilePath.includes('playwright-accessibility.config');

  console.log('[playwright-session] Running global setup session capture');
  await sessionCapture('base');

  if (isAccessibilityRun) {
    console.log('[playwright-session] Pre-capturing shared accessibility session partition');
    await sessionCapture('base', { partitionKey: 'a11y' });
  }
}

export default globalSetup;
