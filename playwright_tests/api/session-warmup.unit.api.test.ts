import { expect, test } from '@playwright/test';
import { resolveSessionWarmupRequests } from '../helpers/sessionWarmup';

test('warms only the AO identity required by each authenticated suite', () => {
  expect(resolveSessionWarmupRequests('e2e')).toEqual([{ user: 'base' }]);
  expect(resolveSessionWarmupRequests('integration')).toEqual([{ user: 'base' }]);
  expect(resolveSessionWarmupRequests('nightly')).toEqual([{ user: 'base' }]);
  expect(resolveSessionWarmupRequests('api')).toEqual([{ user: 'api', options: { partitionKey: 'api' } }]);
});
