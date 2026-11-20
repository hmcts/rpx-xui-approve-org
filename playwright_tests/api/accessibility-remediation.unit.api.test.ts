import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

test('accessibility remediation pack and report integration checks', () => {
  const testFile = path.resolve(__dirname, '../common/reporters/accessibility-remediation.test.cjs');
  const result = spawnSync(process.execPath, ['--test', testFile], { encoding: 'utf8' });
  expect(result.status, result.error?.message || result.stderr + result.stdout).toBe(0);
});
