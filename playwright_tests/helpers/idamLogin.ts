import { type Locator, type Page } from '@playwright/test';

const LOGIN_SURFACE_TIMEOUT_MS = 30_000;
const LOGIN_SURFACE_EMAIL_STEP_TIMEOUT_MS = 4_000;
const LOGIN_SURFACE_REFRESH_ATTEMPTS = 5;

function emailCandidates(page: Page): Locator[] {
  return [
    page.locator('input[name="username"]').first(),
    page.locator('input#email, input[name="email"], input[type="email"]').first(),
    page.getByRole('textbox', { name: /Email address|Enter your work email address/i }).first()
  ];
}

function passwordCandidates(page: Page): Locator[] {
  return [
    page.locator('input[name="password"]').first(),
    page.locator('input#password, input[type="password"]').first(),
    page.getByLabel('Password').first()
  ];
}

function submitCandidates(page: Page): Locator[] {
  return [
    page.getByRole('button', { name: /^(Continue|Sign in)$/i }).first(),
    page.locator('#login-submit-btn').first(),
    page.locator('button:has-text("Continue"), button:has-text("Sign in"), input[type="submit"]').first()
  ];
}

async function firstVisible(candidates: Locator[], timeoutMs: number): Promise<Locator | undefined> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, Math.min(250, Math.max(0, deadline - Date.now()))));
  }

  return undefined;
}

async function submitStep(page: Page, submitButton: Locator | undefined, activeField: Locator): Promise<void> {
  if (submitButton && await submitButton.isVisible().catch(() => false)) {
    await submitButton.click();
  } else {
    await activeField.press('Enter');
  }
  await page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => undefined);
}

async function waitForEmailInput(page: Page): Promise<Locator | undefined> {
  for (let attempt = 1; attempt <= LOGIN_SURFACE_REFRESH_ATTEMPTS; attempt++) {
    const emailInput = await firstVisible(emailCandidates(page), LOGIN_SURFACE_EMAIL_STEP_TIMEOUT_MS);
    if (emailInput) {
      return emailInput;
    }

    if (attempt < LOGIN_SURFACE_REFRESH_ATTEMPTS) {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
    }
  }

  return undefined;
}

export async function completeIdamLogin(page: Page, username: string, password: string): Promise<void> {
  const emailInput = await waitForEmailInput(page);
  if (!emailInput) {
    throw new Error(`IDAM email input was not visible. Current URL: ${page.url()}`);
  }

  await emailInput.fill(username);

  let passwordInput = await firstVisible(passwordCandidates(page), 1_000);
  let submitButton = await firstVisible(submitCandidates(page), 1_000);

  if (!passwordInput) {
    await submitStep(page, submitButton, emailInput);
    passwordInput = await firstVisible(passwordCandidates(page), LOGIN_SURFACE_TIMEOUT_MS);
    submitButton = await firstVisible(submitCandidates(page), 1_000);
  }

  if (!passwordInput) {
    throw new Error(`IDAM password input was not visible after submitting email. Current URL: ${page.url()}`);
  }

  await passwordInput.fill(password);
  await submitStep(page, submitButton, passwordInput);
}
