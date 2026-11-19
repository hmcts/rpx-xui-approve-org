import type { Page } from '@playwright/test';
import { expect, test } from '../page-objects/page.fixtures';
import { openAccessibilityMockApp, setupAccessibilityMockSession } from '../accessibility/helpers/accessibility-mock-session';
import { clearOrganisationSearchSession } from './helpers/organisation-search.helpers';
import { createMockOrganisation, setupStandardOrganisationApprovalsApiMocks } from './mocks';

const ORGANISATION_UPDATE_ID = 'PW-ORG-UPDATE-001';
const ORGANISATION_UPDATE_NAME = 'Playwright Independent Organisation';
const organisationUpdate = createMockOrganisation({
  organisationIdentifier: ORGANISATION_UPDATE_ID,
  name: ORGANISATION_UPDATE_NAME,
  status: 'ACTIVE',
  sraId: 'SRA-PW-001',
  dateRequested: '2026-10-20T12:00:00.000Z',
  contactInformation: [{
    addressLine1: '10 Independent Street',
    addressLine2: 'Test District',
    addressLine3: '',
    townCity: 'Leeds',
    county: 'West Yorkshire',
    postCode: 'LS1 1AA',
    dxAddress: [{ dxNumber: 'DX 101', dxExchange: 'Leeds' }]
  }],
  superUser: {
    userIdentifier: 'pw-requester-001',
    firstName: 'Alex',
    lastName: 'Requester',
    email: 'alex.requester@example.com'
  }
});

async function openOrganisationUpdateReview(page: Page) {
  await clearOrganisationSearchSession(page);
  await setupAccessibilityMockSession(page);
  const apiMocks = await setupStandardOrganisationApprovalsApiMocks(page, {
    organisations: {
      singleOrganisationsById: { [ORGANISATION_UPDATE_ID]: organisationUpdate }
    }
  });

  await openAccessibilityMockApp(page, `/organisation-update/${ORGANISATION_UPDATE_ID}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Review organisation update' })).toBeVisible();
  return apiMocks;
}

test.describe(
  'Playwright integration: organisation update decisions',
  { tag: ['@organisation-updates', '@positive'] },
  () => {
    test('Accept shows an accessible confirmation and returns to organisations', async ({ page }) => {
      const apiMocks = await openOrganisationUpdateReview(page);
      const comparisonTable = page.getByRole('table', { name: 'Organisation update comparison' });

      await expect(comparisonTable).toBeVisible();
      await expect(comparisonTable.getByRole('columnheader', { name: 'Current details' })).toBeVisible();
      await expect(comparisonTable.getByRole('columnheader', { name: 'Requested update' })).toBeVisible();
      await expect(comparisonTable).toContainText(ORGANISATION_UPDATE_NAME);
      expect(apiMocks.getLastSingleOrganisationId()).toBe(ORGANISATION_UPDATE_ID);

      await page.getByRole('button', { name: 'Accept', exact: true }).click();

      await expect(page).toHaveURL(/\/organisation-update-accepted(?:\/?|\?.*)$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Organisation update accepted' })).toBeVisible();
      await expect(page.getByRole('main')).toContainText('The requested organisation details are now current.');

      await page.getByRole('link', { name: 'Back to Organisation updates' }).click();
      await expect(page).toHaveURL(/\/organisation\/updates(?:\/?|\?.*)$/);
    });

    test('Reject shows an accessible confirmation and leaves the changes unapplied', async ({ page }) => {
      await openOrganisationUpdateReview(page);

      await page.getByRole('button', { name: 'Reject', exact: true }).click();

      await expect(page).toHaveURL(/\/organisation-update-rejected(?:\/?|\?.*)$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Organisation update rejected' })).toBeVisible();
      await expect(page.getByRole('main')).toContainText('The requested changes have not been applied.');
      await expect(page.getByRole('link', { name: 'Back to Organisation updates' })).toHaveAttribute(
        'href',
        '/organisation/updates'
      );
    });
  }
);
