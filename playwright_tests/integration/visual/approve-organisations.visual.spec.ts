import { test, expect } from '../../page-objects/page.fixtures';
import { setupNavigationLinksIntegrationPage } from '../helpers/navigation-links.helpers';

test.describe('EXUI-5437 Approve Organisations visual comparison', () => {
  test('pending navigation, table and approval form states', async ({ page, organisationApprovalsPage }) => {
    const { pendingOrganisationId, pendingOrganisationName } = await setupNavigationLinksIntegrationPage(page);

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
    const { activeOrganisationName } = await setupNavigationLinksIntegrationPage(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisationName)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main#main-content')).toHaveScreenshot('active-navigation-table.png', {
      animations: 'disabled'
    });
  });
});
