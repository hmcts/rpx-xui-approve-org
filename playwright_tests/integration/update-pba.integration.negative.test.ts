import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupUpdatePbaApiMock,
  waitForUpdatePbaResponseWithHttpStatus,
} from './mocks';

const UPDATE_PBA_ORG_ID = process.env.PW_INTEGRATION_UPDATE_PBA_ORG_ID || process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';
const EXISTING_PBA = process.env.PW_INTEGRATION_EXISTING_PBA || 'PBA1234567';
const INVALID_PBA = 'PBA123';
const UPDATED_PBA = 'PBA7654321';
const UPDATE_PBA_API_FIELD_ERROR_SCENARIOS = [
  {
    statusCode: 400,
    responseBody: {
      errorDescription: `PBANumber:${UPDATED_PBA} failed validation`,
      errorMessage: 'PBA number already exists',
      timestamp: '2026-06-17T00:00:00.000Z',
    },
  },
  {
    statusCode: 409,
    responseBody: {
      errorDescription: `PBANumber:${UPDATED_PBA} is already associated to another organisation`,
      errorMessage: 'Conflict: PBA number already exists',
      timestamp: '2026-06-17T00:00:00.000Z',
    },
  },
  {
    statusCode: 422,
    responseBody: {
      errorDescription: `PBANumber:${UPDATED_PBA} cannot be updated for this organisation`,
      errorMessage: 'PBA_NUMBER Invalid or already exists',
      timestamp: '2026-06-17T00:00:00.000Z',
    },
  },
];
const UPDATE_PBA_SERVER_ERROR_RESPONSE = {
  timestamp: '2026-06-17T00:00:00.000Z',
  status: 500,
  error: 'Internal Server Error',
  message: 'Internal server error',
};
const PBA_ALREADY_USED_ERROR_MESSAGE =
  'This PBA number PBA7654321 has already been used. You should check that the PBA has been entered correctly. You should also check if your organisationhas already been registered. If you are still having problems, contact HMCTS.';

test.describe('Playwright integration: update pba negative paths', { tag: ['@update-pba', '@negative'] }, () => {
  test('Change PBA UI shows validation error for invalid PBA format', async ({ page, updatePbaPage }) => {
    let updatePbaApiMock: { getLastPayload: any };

    await test.step('Setup mocked organisation APIs', async () => {
      const mockedOrganisation = createMockOrganisation({
        organisationIdentifier: UPDATE_PBA_ORG_ID,
        name: 'Update PBA UI Mock Org',
        status: 'ACTIVE',
        paymentAccount: [EXISTING_PBA],
        pendingPaymentAccount: [],
      });

      await setupCommonOrganisationApiMocks(page, {
        activeOrganisations: [mockedOrganisation],
        singleOrganisationsById: {
          [UPDATE_PBA_ORG_ID]: mockedOrganisation,
        },
      });

      updatePbaApiMock = await setupUpdatePbaApiMock(page);
    });

    await test.step('Open edit PBA page', async () => {
      await ensureAuthenticatedPage(page, 'base');
      const editPbaUrl = new URL(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`, config.baseUrl).toString();
      await page.goto(editPbaUrl);

      await expect(updatePbaPage.heading).toBeVisible();
      await expect(updatePbaPage.pbaInput).toHaveValue(EXISTING_PBA);
    });

    await test.step('Submit invalid PBA', async () => {
      await updatePbaPage.updatePbaNumber(INVALID_PBA);
      await expect(updatePbaPage.pbaInput).toHaveValue(INVALID_PBA);
      await updatePbaPage.submit();
    });

    await test.step('Verify validation error and no update request', async () => {
      await expect(updatePbaPage.validationSummary).toBeVisible();
      await expect(updatePbaPage.pbaInputError).toBeVisible();
      expect(updatePbaApiMock?.getLastPayload()).toBeUndefined();
    });
  });

  for (const scenario of UPDATE_PBA_API_FIELD_ERROR_SCENARIOS) {
    test(`Change PBA UI shows API error when update request returns HTTP ${scenario.statusCode}`, async ({
      page,
      updatePbaPage,
    }) => {
      let updatePbaApiMock: { getLastPayload: any };

      await test.step('Setup mocked organisation APIs', async () => {
        const mockedOrganisation = createMockOrganisation({
          organisationIdentifier: UPDATE_PBA_ORG_ID,
          name: 'Update PBA UI Mock Org',
          status: 'ACTIVE',
          paymentAccount: [EXISTING_PBA],
          pendingPaymentAccount: [],
        });

        await setupCommonOrganisationApiMocks(page, {
          activeOrganisations: [mockedOrganisation],
          singleOrganisationsById: {
            [UPDATE_PBA_ORG_ID]: mockedOrganisation,
          },
        });

        updatePbaApiMock = await setupUpdatePbaApiMock(page, {
          status: scenario.statusCode,
          responseBody: scenario.responseBody,
        });
      });

      await test.step('Open edit PBA page', async () => {
        await ensureAuthenticatedPage(page, 'base');
        const editPbaUrl = new URL(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`, config.baseUrl).toString();
        await page.goto(editPbaUrl);

        await expect(updatePbaPage.heading).toBeVisible();
        await expect(updatePbaPage.pbaInput).toHaveValue(EXISTING_PBA);
      });

      await test.step('Submit updated PBA', async () => {
        await updatePbaPage.updatePbaNumber(UPDATED_PBA);
        await expect(updatePbaPage.pbaInput).toHaveValue(UPDATED_PBA);
        const updatePbaResponse = waitForUpdatePbaResponseWithHttpStatus(page, scenario.statusCode);
        await updatePbaPage.submit();
        await updatePbaResponse;
      });

      await test.step('Verify API error state', async () => {
        expect(updatePbaApiMock?.getLastPayload()).toEqual({
          paymentAccounts: [UPDATED_PBA],
          orgId: UPDATE_PBA_ORG_ID,
        });
        await expect(updatePbaPage.validationSummary).toBeVisible();
        await expect(updatePbaPage.pbaInputError).toBeVisible();
        await expect(updatePbaPage.pbaInputError).toContainText(PBA_ALREADY_USED_ERROR_MESSAGE);
      });
    });
  }

  test('Change PBA UI stays on edit page when update request returns HTTP 500', async ({ page, updatePbaPage }) => {
    let updatePbaApiMock: { getLastPayload: any };

    await test.step('Setup mocked organisation APIs', async () => {
      const mockedOrganisation = createMockOrganisation({
        organisationIdentifier: UPDATE_PBA_ORG_ID,
        name: 'Update PBA UI Mock Org',
        status: 'ACTIVE',
        paymentAccount: [EXISTING_PBA],
        pendingPaymentAccount: [],
      });

      await setupCommonOrganisationApiMocks(page, {
        activeOrganisations: [mockedOrganisation],
        singleOrganisationsById: {
          [UPDATE_PBA_ORG_ID]: mockedOrganisation,
        },
      });

      updatePbaApiMock = await setupUpdatePbaApiMock(page, {
        status: 500,
        responseBody: UPDATE_PBA_SERVER_ERROR_RESPONSE,
      });
    });

    await test.step('Open edit PBA page', async () => {
      await ensureAuthenticatedPage(page, 'base');
      const editPbaUrl = new URL(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`, config.baseUrl).toString();
      await page.goto(editPbaUrl);

      await expect(updatePbaPage.heading).toBeVisible();
      await expect(updatePbaPage.pbaInput).toHaveValue(EXISTING_PBA);
    });

    await test.step('Submit updated PBA', async () => {
      await updatePbaPage.updatePbaNumber(UPDATED_PBA);
      await expect(updatePbaPage.pbaInput).toHaveValue(UPDATED_PBA);
      const updatePbaResponse = waitForUpdatePbaResponseWithHttpStatus(page, 500);
      await updatePbaPage.submit();
      await updatePbaResponse;
    });

    await test.step('Verify server error does not redirect or show field validation', async () => {
      expect(updatePbaApiMock?.getLastPayload()).toEqual({
        paymentAccounts: [UPDATED_PBA],
        orgId: UPDATE_PBA_ORG_ID,
      });
      await expect(page).toHaveURL(new RegExp(`/change/pba/${UPDATE_PBA_ORG_ID}/${EXISTING_PBA}`));
      await expect(updatePbaPage.pbaInput).toHaveValue(UPDATED_PBA);
      await expect(updatePbaPage.validationSummary).toBeHidden();
      await expect(updatePbaPage.pbaInputError).toBeHidden();
    });
  });
});
