import type { FullConfig } from '@playwright/test';
import { sessionCapture } from './sessionCapture';

async function globalSetup(_fullConfig: FullConfig): Promise<void> {
  void _fullConfig;
  console.log('[playwright-session] Running global setup session capture');
  await sessionCapture('base');
}

export default globalSetup;
