import { test, expect } from '../../page-objects/page.fixtures';
import {
  openAccessibilityMockApp,
  setupAccessibilityMockSession
} from '../../accessibility/helpers/accessibility-mock-session';
import { setupNavigationLinksIntegrationPage } from '../helpers/navigation-links.helpers';

test.describe('EXUI-5433 Approve Organisations visual comparison', () => {
  test.beforeEach(async ({ page }) => {
    await setupAccessibilityMockSession(page);
    await page.route('**/api/environment/config*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          configEnv: 'playwright',
          cookies: { roles: 'roles', token: '__auth__', userId: 'userId' },
          idamClient: 'xui_webapp',
          oauthCallbackUrl: '/oauth2/callback',
          protocol: 'https',
          services: { idamWeb: 'https://idam-web.mock' },
          oidcEnabled: true,
          launchDarklyClientId: 'test-client-id'
        })
      });
    });
    await page.route(/launchdarkly\.com/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'mo-new-register-org': { value: true, variation: 1, version: 1 },
          '$flagsState': { 'mo-new-register-org': { variation: 1, version: 1 } }
        })
      });
    });
  });

  test('pending navigation, table and approval form states', async ({ page, organisationApprovalsPage }) => {
    const { pendingOrganisationId, pendingOrganisationName } = await setupNavigationLinksIntegrationPage(page, {
      authenticate: false
    });
    await openAccessibilityMockApp(page);

    await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingOrganisationName)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main#main-content')).toHaveScreenshot('pending-navigation-table.png', {
      animations: 'disabled'
    });

    await organisationApprovalsPage.openFirstPendingOrganisation();
    await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
    await expect(organisationApprovalsPage.decisionOptionsGroup).toBeVisible();
    const organisationSummaryRows = page.locator('.govuk-summary-list__row');
    await expect(organisationSummaryRows.filter({ hasText: 'Service to access' }).locator('.govuk-summary-list__value'))
      .toHaveText('Civil');
    await expect(organisationSummaryRows.filter({ hasText: 'Organisation type' }).locator('.govuk-summary-list__value'))
      .toHaveText('Solicitor');
    await expect(organisationApprovalsPage.detailsPanel).toHaveScreenshot('approval-form-unselected.png', {
      animations: 'disabled'
    });

    await organisationApprovalsPage.chooseDecision('Approve it');
    await expect(organisationApprovalsPage.detailsPanel).toHaveScreenshot('approval-form-selected.png', {
      animations: 'disabled'
    });

    await organisationApprovalsPage.submitDecision();
    await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
    await expect(organisationApprovalsPage.contentMain).toHaveScreenshot('approval-confirmation.png', {
      animations: 'disabled'
    });
  });

  test('active navigation and table state', async ({ page, organisationApprovalsPage }) => {
    const { activeOrganisationName } = await setupNavigationLinksIntegrationPage(page, { authenticate: false });
    await openAccessibilityMockApp(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisationName)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main#main-content')).toHaveScreenshot('active-navigation-table.png', {
      animations: 'disabled'
    });
  });
});
