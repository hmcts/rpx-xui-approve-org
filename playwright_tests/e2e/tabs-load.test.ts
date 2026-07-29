import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';

test.describe('Organisation approvals tabs load', { tag: ['@e2e', '@organisations', '@tabs-load'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, 'base');
  });

  test('all tabs on login load data', async ({ organisationApprovalsPage }) => {
    await test.step('Validate landing tab content', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationDataRows.first()).toBeVisible();

      const pendingOrganisationRows = await organisationApprovalsPage.pendingOrganisationTableRows();
      expect(pendingOrganisationRows.length).toBeGreaterThan(0);
      expect(pendingOrganisationRows[0]).toEqual(expect.objectContaining({
        name: expect.stringMatching(/\S/),
        organisationIdentifier: expect.stringMatching(/\S/),
        address: expect.stringMatching(/\S/),
        administrator: expect.stringMatching(/\S/),
        administratorEmail: expect.stringMatching(/\S/),
        date: expect.stringMatching(/\S/),
        status: expect.stringMatching(/\S/)
      }));
    });

    await test.step('Open New PBAs tab and verify content', async () => {
      await organisationApprovalsPage.openNewPbasTab();
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingPbaRows.first()).toBeVisible();

      const pendingPbaRows = await organisationApprovalsPage.pendingPbaTableRows();
      expect(pendingPbaRows.length).toBeGreaterThan(0);
      expect(pendingPbaRows[0]).toEqual(expect.objectContaining({
        organisationName: expect.stringMatching(/\S/),
        pbaNumbers: expect.arrayContaining([expect.stringMatching(/\S/)]),
        administrator: expect.stringMatching(/\S/),
        administratorEmail: expect.stringMatching(/\S/),
        dateReceived: expect.stringMatching(/\S/)
      }));
    });

    await test.step('Open Active organisations tab and verify content', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationDataRows.first()).toBeVisible();

      const activeOrganisationRows = await organisationApprovalsPage.activeOrganisationTableRows();
      expect(activeOrganisationRows.length).toBeGreaterThan(0);
      expect(activeOrganisationRows[0]).toEqual(expect.objectContaining({
        name: expect.stringMatching(/\S/),
        organisationIdentifier: expect.stringMatching(/\S/),
        address: expect.stringMatching(/\S/),
        administrator: expect.stringMatching(/\S/),
        administratorEmail: expect.stringMatching(/\S/),
        date: expect.stringMatching(/\S/),
        status: expect.stringMatching(/\S/)
      }));
    });
  });
});
