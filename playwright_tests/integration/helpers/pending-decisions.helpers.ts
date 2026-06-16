import { expect, type Page } from '@playwright/test';

type PendingDecisionApiMockControl = {
  getLastMethod: () => string | undefined;
  getLastPayload: () => {
    organisationIdentifier?: string;
    status?: string;
  } | undefined;
};

export async function assertPendingDecisionDetailsPage(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
}

export async function assertPendingDecisionConfirmPage(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
}

export function assertPendingDecisionRequest(
  decisionApiMock: PendingDecisionApiMockControl,
  expectedMethod: 'PUT' | 'DELETE',
  organisationId: string,
  expectedStatus?: 'ACTIVE' | 'REVIEW'
): void {
  expect(decisionApiMock.getLastMethod()).toEqual(expectedMethod);

  if (!expectedStatus) {
    return;
  }

  const lastPayload = decisionApiMock.getLastPayload();
  expect(lastPayload?.organisationIdentifier).toEqual(organisationId);
  expect(lastPayload?.status).toEqual(expectedStatus);
}

export async function assertPendingDecisionSuccess(page: Page, successBannerText: RegExp): Promise<void> {
  await expect(page).toHaveURL(/\/organisation\/pending/);
  await expect(page.getByText(successBannerText)).toBeVisible();
}
