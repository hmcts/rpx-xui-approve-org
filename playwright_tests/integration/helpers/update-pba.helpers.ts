import { expect, type Locator, type Page } from '@playwright/test';

type UpdatePbaApiMockControl = {
  getLastPayload: () => {
    paymentAccounts: string[];
    orgId: string;
  } | undefined;
};

export async function assertUpdatePbaPageReady(page: Page, existingPba: string): Promise<Locator> {
  await expect(page.getByRole('heading', { name: 'Organisation payment by account (PBA) number' })).toBeVisible();

  const pbaInput = page.locator('#pba1');
  await expect(pbaInput).toBeVisible();
  await expect(pbaInput).toHaveValue(existingPba);

  return pbaInput;
}

export function assertUpdatePbaPayload(
  updatePbaApiMock: UpdatePbaApiMockControl,
  updatedPba: string,
  organisationId: string
): void {
  expect(updatePbaApiMock.getLastPayload()).toEqual({
    paymentAccounts: [updatedPba],
    orgId: organisationId
  });
}

export async function assertOrganisationDetailsUrl(page: Page, organisationId: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`/organisation-details/${organisationId}`));
}
