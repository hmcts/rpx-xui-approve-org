import { test, expect } from './helpers/integration.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupUpdatePbaApiMock,
  waitForUpdatePbaResponse
} from './mocks';

const UPDATE_PBA_ORG_ID = process.env.PW_INTEGRATION_UPDATE_PBA_ORG_ID || process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';
const EXISTING_PBA = process.env.PW_INTEGRATION_EXISTING_PBA || 'PBA1234567';

test.describe('Playwright integration seed: update pba', { tag: ['@integration','@update-pba'] }, () => {
  test('Change PBA UI submits updated payment account payload', async ({ page }) => {
    const updatedPba = `PBA${Date.now().toString().slice(-7)}`;
    const mockedOrganisation = createMockOrganisation({
      organisationIdentifier: UPDATE_PBA_ORG_ID,
      name: 'Update PBA UI Mock Org',
      status: 'ACTIVE',
      paymentAccount: [EXISTING_PBA],
      pendingPaymentAccount: []
    });

    await setupCommonOrganisationApiMocks(page, {
      activeOrganisations: [mockedOrganisation],
      singleOrganisationsById: {
        [UPDATE_PBA_ORG_ID]: mockedOrganisation
      }
    });

    await page.route('**/api/organisations/*/isDeletable', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(false)
      });
    });

    await page.route('**/api/pbaAccounts/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ account_name: 'Mock Liberata Account' }])
      });
    });

    const updatePbaApiMock = await setupUpdatePbaApiMock(page);

    await ensureAuthenticatedPage(page, 'base');
    const editPbaUrl = new URL(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`, config.baseUrl).toString();
    await page.goto(editPbaUrl);

    await expect(page.getByRole('heading', { name: 'Organisation payment by account (PBA) number' })).toBeVisible();

    const pbaInput = page.locator('#pba1');
    await expect(pbaInput).toBeVisible();
    await expect(pbaInput).toHaveValue(EXISTING_PBA);
    await pbaInput.fill(updatedPba);

    const updateResponse = waitForUpdatePbaResponse(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    await updateResponse;

    expect(updatePbaApiMock.getLastPayload()).toEqual({
      paymentAccounts: [updatedPba],
      orgId: UPDATE_PBA_ORG_ID
    });

    await expect(page).toHaveURL(new RegExp(`/organisation-details/${UPDATE_PBA_ORG_ID}`));
  });
});
