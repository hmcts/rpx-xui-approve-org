import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupPbaAccountsApiMock,
  setupUpdatePbaApiMock,
  waitForUpdatePbaResponse
} from './mocks';

const UPDATE_PBA_ORG_ID = process.env.PW_INTEGRATION_UPDATE_PBA_ORG_ID || process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';
const EXISTING_PBA = process.env.PW_INTEGRATION_EXISTING_PBA || 'PBA1234567';
const SECOND_EXISTING_PBA = 'PBA2222222';
const UPDATED_PBA = 'PBA7654321';
const ADDED_PBA = 'PBA3333333';

test.describe('Playwright integration seed: update pba', { tag: ['@integration', '@update-pba'] }, () => {
  test('Change PBA UI submits updated payment account payload', async ({ page, updatePbaPage, organisationApprovalsPage }) => {
    let updatePbaApiMock: { getLastPayload: any };

    await test.step('Setup mocked organisation APIs', async () => {
      const mockedOrganisation = createMockOrganisation({
        organisationIdentifier: UPDATE_PBA_ORG_ID,
        name: 'Update PBA UI Mock Org',
        status: 'ACTIVE',
        paymentAccount: [EXISTING_PBA],
        pendingPaymentAccount: []
      });
      const singleOrganisationsById = {
        [UPDATE_PBA_ORG_ID]: mockedOrganisation
      };

      await setupCommonOrganisationApiMocks(page, {
        activeOrganisations: [mockedOrganisation],
        singleOrganisationsById
      });
      await setupPbaAccountsApiMock(page);

      await page.route('**/api/organisations/*/isDeletable', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(false)
        });
      });

      updatePbaApiMock = await setupUpdatePbaApiMock(page, {
        singleOrganisationsById
      });
    });

    await test.step('Open edit PBA page', async () => {
      await ensureAuthenticatedPage(page, 'base');
      const editPbaUrl = new URL(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`, config.baseUrl).toString();
      await page.goto(editPbaUrl);

      await expect(updatePbaPage.heading).toBeVisible();
      await expect(updatePbaPage.pbaInput).toBeVisible();
      await expect(updatePbaPage.pbaInput).toHaveValue(EXISTING_PBA);
    });

    await test.step('Submit updated PBA', async () => {
      await updatePbaPage.updatePbaNumber(UPDATED_PBA);
      await expect(updatePbaPage.pbaInput).toHaveValue(UPDATED_PBA);
      const updatePbaResponse = waitForUpdatePbaResponse(page);
      await updatePbaPage.submit();
      await updatePbaResponse;
    });

    await test.step('Verify update API payload and redirect', async () => {
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${UPDATE_PBA_ORG_ID}`));
      expect(updatePbaApiMock?.getLastPayload()).toEqual({
        paymentAccounts: [UPDATED_PBA],
        orgId: UPDATE_PBA_ORG_ID
      });
    });

    await test.step('Verify organisation details show updated PBA', async () => {
      await expect(organisationApprovalsPage.organisationDetailsPbaRow(UPDATED_PBA)).toBeVisible();
    });
  });

  test('Change PBA UI submits updated payload when removing a payment account', async ({
    page,
    updatePbaPage,
    organisationApprovalsPage
  }) => {
    let updatePbaApiMock: { getLastPayload: any };
    const mockedOrganisation = createMockOrganisation({
      organisationIdentifier: UPDATE_PBA_ORG_ID,
      name: 'Remove PBA UI Mock Org',
      status: 'ACTIVE',
      paymentAccount: [EXISTING_PBA, SECOND_EXISTING_PBA],
      pendingPaymentAccount: []
    });
    const singleOrganisationsById = {
      [UPDATE_PBA_ORG_ID]: mockedOrganisation
    };

    await test.step('Setup mocked organisation APIs with multiple PBAs', async () => {
      await setupCommonOrganisationApiMocks(page, {
        activeOrganisations: [mockedOrganisation],
        singleOrganisationsById
      });
      await setupPbaAccountsApiMock(page);

      await page.route('**/api/organisations/*/isDeletable', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(false)
        });
      });

      updatePbaApiMock = await setupUpdatePbaApiMock(page, {
        singleOrganisationsById
      });
    });

    await test.step('Open edit PBA page with multiple PBAs', async () => {
      await ensureAuthenticatedPage(page, 'base');
      const editPbaUrl = new URL(
        `/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA},${SECOND_EXISTING_PBA}`,
        config.baseUrl
      ).toString();
      await page.goto(editPbaUrl);

      await expect(updatePbaPage.heading).toBeVisible();
      await expect(updatePbaPage.pbaInputAt(1)).toHaveValue(EXISTING_PBA);
      await expect(updatePbaPage.pbaInputAt(2)).toHaveValue(SECOND_EXISTING_PBA);
    });

    await test.step('Remove first PBA and submit', async () => {
      await updatePbaPage.removePbaNumberAt(1);
      await expect(updatePbaPage.pbaInputAt(1)).toHaveCount(0);
      await expect(updatePbaPage.pbaInputAt(2)).toHaveValue(SECOND_EXISTING_PBA);
      const updatePbaResponse = waitForUpdatePbaResponse(page);
      await updatePbaPage.submit();
      await updatePbaResponse;
    });

    await test.step('Verify remove payload and redirect', async () => {
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${UPDATE_PBA_ORG_ID}`));
      expect(updatePbaApiMock?.getLastPayload()).toEqual({
        paymentAccounts: [SECOND_EXISTING_PBA],
        orgId: UPDATE_PBA_ORG_ID
      });
      expect(mockedOrganisation.paymentAccount).toEqual([SECOND_EXISTING_PBA]);
    });

    await test.step('Verify organisation details show remaining PBA', async () => {
      await expect(organisationApprovalsPage.organisationDetailsPbaRow(SECOND_EXISTING_PBA)).toBeVisible();
      await expect(organisationApprovalsPage.organisationDetailsPbaRow(EXISTING_PBA)).toHaveCount(0);
    });
  });

  test('Change PBA UI submits updated payload when adding another payment account', async ({
    page,
    updatePbaPage,
    organisationApprovalsPage
  }) => {
    let updatePbaApiMock: { getLastPayload: any };

    await test.step('Setup mocked organisation APIs', async () => {
      const mockedOrganisation = createMockOrganisation({
        organisationIdentifier: UPDATE_PBA_ORG_ID,
        name: 'Add PBA UI Mock Org',
        status: 'ACTIVE',
        paymentAccount: [EXISTING_PBA],
        pendingPaymentAccount: []
      });
      const singleOrganisationsById = {
        [UPDATE_PBA_ORG_ID]: mockedOrganisation
      };

      await setupCommonOrganisationApiMocks(page, {
        activeOrganisations: [mockedOrganisation],
        singleOrganisationsById
      });
      await setupPbaAccountsApiMock(page);

      await page.route('**/api/organisations/*/isDeletable', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(false)
        });
      });

      updatePbaApiMock = await setupUpdatePbaApiMock(page, {
        singleOrganisationsById
      });
    });

    await test.step('Open edit PBA page', async () => {
      await ensureAuthenticatedPage(page, 'base');
      const editPbaUrl = new URL(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`, config.baseUrl).toString();
      await page.goto(editPbaUrl);

      await expect(updatePbaPage.heading).toBeVisible();
      await expect(updatePbaPage.pbaInputAt(1)).toHaveValue(EXISTING_PBA);
    });

    await test.step('Add another PBA and submit', async () => {
      await updatePbaPage.addAnotherPbaNumber();
      await updatePbaPage.updatePbaNumberAt(2, ADDED_PBA);
      await expect(updatePbaPage.pbaInputAt(2)).toHaveValue(ADDED_PBA);
      const updatePbaResponse = waitForUpdatePbaResponse(page);
      await updatePbaPage.submit();
      await updatePbaResponse;
    });

    await test.step('Verify add payload and redirect', async () => {
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${UPDATE_PBA_ORG_ID}`));
      expect(updatePbaApiMock?.getLastPayload()).toEqual({
        paymentAccounts: [EXISTING_PBA, ADDED_PBA],
        orgId: UPDATE_PBA_ORG_ID
      });
    });

    await test.step('Verify organisation details show both PBAs', async () => {
      await expect(organisationApprovalsPage.organisationDetailsPbaRow(EXISTING_PBA)).toBeVisible();
      await expect(organisationApprovalsPage.organisationDetailsPbaRow(ADDED_PBA)).toBeVisible();
    });
  });
});
