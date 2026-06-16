import { expect } from '@playwright/test';
import { test } from './helpers/integration.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import { UpdatePbaPage } from '../page-objects/pages';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupUpdatePbaApiMock,
  waitForUpdatePbaResponse
} from './mocks';

const UPDATE_PBA_ORG_ID = process.env.PW_INTEGRATION_UPDATE_PBA_ORG_ID || process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';
const EXISTING_PBA = process.env.PW_INTEGRATION_EXISTING_PBA || 'PBA1234567';

test.describe('Playwright integration seed: update pba', { tag: ['@integration', '@update-pba'] }, () => {
  test('Change PBA UI submits updated payment account payload', async ({ page }) => {
    const updatedPba = `PBA${Date.now().toString().slice(-7)}`;
    const updatePbaApiMock = await test.step('Setup mocked organisation APIs', async () => {
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

      return setupUpdatePbaApiMock(page);
    });

    const updatePbaPage = await test.step('Open edit PBA page', async () => {
      await ensureAuthenticatedPage(page, 'base');
      const editPbaUrl = new URL(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`, config.baseUrl).toString();
      await page.goto(editPbaUrl);

      const pbaPage = new UpdatePbaPage(page);
      await expect(pbaPage.heading).toBeVisible();
      await expect(pbaPage.pbaInput).toBeVisible();
      await expect(pbaPage.pbaInput).toHaveValue(EXISTING_PBA);
      return pbaPage;
    });

    await test.step('Submit updated PBA', async () => {
      await updatePbaPage.updatePbaNumber(updatedPba);
      const updateResponse = waitForUpdatePbaResponse(page);
      await updatePbaPage.submit();
      await updateResponse;
    });

    await test.step('Verify update payload and redirect', async () => {
      expect(updatePbaApiMock.getLastPayload()).toEqual({
        paymentAccounts: [updatedPba],
        orgId: UPDATE_PBA_ORG_ID
      });
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${UPDATE_PBA_ORG_ID}`));
    });
  });
});
