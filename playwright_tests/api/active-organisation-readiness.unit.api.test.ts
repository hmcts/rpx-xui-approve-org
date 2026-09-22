import { expect, test } from '@playwright/test';
import { OrganisationApprovalsPage } from '../page-objects/pages/exui/organisation-approvals.page';

const activeTableHtml = (rows = '') => `
  <main id="content">
    <div class="govuk-tabs">
      <ul class="govuk-tabs__list">
        <li><a class="govuk-tabs__tab govuk-tabs__tab--selected" href="/organisation/active">Active organisations</a></li>
      </ul>
    </div>
    <app-prd-org-overview-component>
      <table class="govuk-table active-organisations">
        <thead>
          <tr><th>Organisation name</th><th>Organisation ID</th><th>Action</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </app-prd-org-overview-component>
  </main>
`;

test.describe('active organisation readiness', () => {
  test('treats a loaded empty active organisations table as ready', async ({ page }) => {
    await page.setContent(activeTableHtml());

    await new OrganisationApprovalsPage(page).waitForActiveOrganisationResults(1_000);
  });

  test('waits for the loaded table instead of passing on the blank active view', async ({ page }) => {
    await page.setContent('<main id="content"><app-prd-org-overview-component></app-prd-org-overview-component></main>');

    const readiness = new OrganisationApprovalsPage(page).waitForActiveOrganisationResults(5_000);
    await expect(page.locator('table.active-organisations')).toHaveCount(0);

    await page.locator('app-prd-org-overview-component').evaluate((element, html) => {
      element.innerHTML = html;
    }, '<table class="govuk-table active-organisations"><tbody><tr class="govuk-table__row"><td>Org</td><td>ORG1</td><td><a href="/organisation-details/ORG1">View</a></td></tr></tbody></table>');

    await readiness;
  });

  test('rejects blank, hidden, and wrong-tab tables', async ({ page }) => {
    const organisationApprovalsPage = new OrganisationApprovalsPage(page);

    await page.setContent('<main id="content"><app-prd-org-overview-component></app-prd-org-overview-component></main>');
    await expect(organisationApprovalsPage.waitForActiveOrganisationResults(200)).rejects.toThrow(
      /Active organisation results did not become available/
    );

    await page.setContent('<main id="content"><app-prd-org-overview-component style="display:none"><table class="active-organisations"></table></app-prd-org-overview-component></main>');
    await expect(organisationApprovalsPage.waitForActiveOrganisationResults(200)).rejects.toThrow(
      /Active organisation results did not become available/
    );

    await page.setContent('<main id="content"><app-pending-overview-component><table class="active-organisations"></table></app-pending-overview-component></main>');
    await expect(organisationApprovalsPage.waitForActiveOrganisationResults(200)).rejects.toThrow(
      /Active organisation results did not become available/
    );
  });

  test('surfaces service errors instead of treating them as ready', async ({ page }) => {
    await page.setContent(`
      <main id="content">
        <h1>Sorry, there is a problem with the service</h1>
        <p>Try again later</p>
      </main>
    `);

    await expect(new OrganisationApprovalsPage(page).waitForActiveOrganisationResults(1_000)).rejects.toThrow(
      /Organisation results are unavailable/
    );
  });
});
