import { expect, test } from '@playwright/test';
import { completeIdamLogin } from '../helpers/idamLogin';

test('submits a progressive IDAM login through Continue then Sign in', async () => {
  let step: 'email' | 'password' | 'complete' = 'email';
  const fills: string[] = [];
  const clicks: string[] = [];
  const createLocator = (kind: 'email' | 'password' | 'continue' | 'sign-in') => {
    const visible = () =>
      (kind === 'email' && step === 'email') ||
      (kind === 'password' && step === 'password') ||
      (kind === 'continue' && step === 'email') ||
      (kind === 'sign-in' && step === 'password');
    return {
      first: () => createLocator(kind),
      isVisible: async () => visible(),
      fill: async (value: string) => { fills.push(`${kind}:${value}`); },
      click: async () => {
        clicks.push(kind);
        step = kind === 'continue' ? 'password' : 'complete';
      },
      press: async () => undefined
    };
  };
  const page = {
    locator: (selector: string) => selector.includes('password')
      ? createLocator('password')
      : selector.includes('email') || selector.includes('username')
        ? createLocator('email')
        : createLocator('continue'),
    getByRole: (_role: string, options?: { name?: RegExp }) => options?.name?.source.includes('Continue')
      ? createLocator(step === 'email' ? 'continue' : 'sign-in')
      : createLocator('email'),
    getByLabel: () => createLocator('password'),
    waitForLoadState: async () => undefined,
    reload: async () => undefined,
    url: () => 'https://idam.example.test/login'
  };

  await completeIdamLogin(page as never, 'user@example.test', 'not-a-real-password');

  expect(fills).toEqual(['email:user@example.test', 'password:not-a-real-password']);
  expect(clicks).toEqual(['continue', 'sign-in']);
});
