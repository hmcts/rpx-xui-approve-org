import type { FullConfig } from '@playwright/test';
import { sessionCapture } from './sessionCapture';

async function globalSetup(_fullConfig: FullConfig): Promise<void> {
  void _fullConfig;
  if ((process.env.PW_SKIP_SESSION_CAPTURE ?? '').toLowerCase() === 'true') {
    console.log('[playwright-session] Skipping global setup session capture (PW_SKIP_SESSION_CAPTURE=true)');
    return;
  }
  console.log('[playwright-session] Running global setup session capture');
  await sessionCapture('base');
}

export default globalSetup;
