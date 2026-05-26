import type { Page } from '@playwright/test';

export async function setupLovRefDataApiMock(page: Page, listOfValues: unknown[] = []): Promise<void> {
  await page.route('**/api/getLovRefData**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(listOfValues)
    });
  });
}
