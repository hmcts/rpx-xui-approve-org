import type { Page, Response } from '@playwright/test';

type UpdatePbaApiMockState = {
  status?: number;
  responseBody?: unknown;
};

type UpdatePbaApiPayload = {
  paymentAccounts: string[];
  orgId: string;
};

type UpdatePbaApiMockControl = {
  getLastPayload: () => UpdatePbaApiPayload | undefined;
};

export async function setupUpdatePbaApiMock(
  page: Page,
  state: UpdatePbaApiMockState = {}
): Promise<UpdatePbaApiMockControl> {
  let lastPayload: UpdatePbaApiPayload | undefined;

  await page.route('**/api/updatePba**', async (route, request) => {
    try {
      lastPayload = request.postDataJSON() as UpdatePbaApiPayload;
    } catch {
      lastPayload = undefined;
    }

    await route.fulfill({
      status: state.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(state.responseBody ?? { ok: true })
    });
  });

  return {
    getLastPayload: () => lastPayload
  };
}

export async function setupPbaAccountsApiMock(page: Page, accountNames: string[] = ['Mock Liberata Account']): Promise<void> {
  await page.route('**/api/pbaAccounts/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(accountNames.map((accountName) => ({ account_name: accountName })))
    });
  });
}

export function waitForUpdatePbaResponse(page: Page): Promise<Response> {
  return page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === 'PUT' && request.url().includes('/api/updatePba') && response.status() < 500;
  });
}
