import { expect, test } from '@playwright/test';
import { OrganisationApprovalsPage } from '../page-objects/pages/exui/organisation-approvals.page';

test.describe('organisation approvals page', () => {
  test('waits for a user row after the users panel becomes visible', async ({ page }) => {
    await page.setContent('<xuilib-user-list><table><tbody></tbody></table></xuilib-user-list>');
    const organisationApprovalsPage = new OrganisationApprovalsPage(page);

    await page.locator('xuilib-user-list tbody').evaluate((element) => {
      window.setTimeout(() => {
        element.innerHTML = '<tr><td>Test user</td></tr>';
      }, 50);
    });

    await organisationApprovalsPage.waitForUserRows();
    await expect(organisationApprovalsPage.usersTableRows).toHaveCount(1);
  });

  test('opens the active organisation matching its identifier when an earlier result is stale', async ({ page }) => {
    await page.route('**/*', async (route) => {
      const isTargetDetails = route.request().url().includes('/organisation-details/TARGET');
      await route.fulfill({
        contentType: 'text/html',
        body: isTargetDetails
          ? '<main id="content"><app-org-details-info style="display:block">Organisation details</app-org-details-info></main>'
          : '<main id="content"></main>'
      });
    });
    await page.goto('http://example.test/organisation/active');
    await page.setContent(`
      <app-prd-org-overview-component>
        <table class="active-organisations"><tbody>
          <tr><td><a class="govuk-link" href="/organisation-details/TARGET-STALE">View stale</a></td></tr>
          <tr><td><a class="govuk-link" href="/organisation-details/TARGET">View target</a></td></tr>
        </tbody></table>
      </app-prd-org-overview-component>
    `);

    await new OrganisationApprovalsPage(page).openActiveOrganisationById('TARGET');

    await expect(page).toHaveURL(/\/organisation-details\/TARGET$/);
  });

  test('re-searches until the active organisation matching its identifier is returned', async ({ page }) => {
    await page.setContent(`
      <app-prd-org-overview-component>
        <table class="active-organisations"><tbody>
          <tr><td><a class="govuk-link" href="/organisation-details/STALE">View stale</a></td></tr>
        </tbody></table>
      </app-prd-org-overview-component>
      <div class="search-organisations-form"><form><input id="search"><button class="hmcts-search__button" type="button">Search</button></form></div>
    `);
    await page.locator('.hmcts-search__button').evaluate((button) => {
      let searches = 0;
      button.addEventListener('click', () => {
        searches += 1;
        if (searches === 2) {
          document.querySelector('table tbody')!.innerHTML = '<tr><td><a class="govuk-link" href="/organisation-details/TARGET">View target</a></td></tr>';
        }
      });
    });

    const organisationApprovalsPage = new OrganisationApprovalsPage(page);
    await expect.poll(async () => {
      await organisationApprovalsPage.searchForActiveOrganisation('Test organisation', 'TARGET', 2_000);
      return organisationApprovalsPage.activeOrganisationRowById('TARGET').count();
    }).toBeGreaterThan(0);

    await expect(page.locator('a[href="/organisation-details/TARGET"]')).toBeVisible();
  });

  test('surfaces an active-organisation service error while waiting for an exact result', async ({ page }) => {
    await page.setContent(`
      <app-prd-org-overview-component><table class="active-organisations"><tbody></tbody></table></app-prd-org-overview-component>
      <div class="search-organisations-form"><form><input id="search"><button class="hmcts-search__button" type="button">Search</button></form></div>
    `);
    await page.locator('.hmcts-search__button').evaluate((button) => {
      button.addEventListener('click', () => {
        document.body.insertAdjacentHTML('afterbegin', '<h1>Sorry, there is a problem with the service</h1>');
      });
    });

    const organisationApprovalsPage = new OrganisationApprovalsPage(page);
    await organisationApprovalsPage.searchForActiveOrganisation('Test organisation', 'TARGET', 2_000);
    await expect(organisationApprovalsPage.serviceErrorHeading).toBeVisible();
    await expect(organisationApprovalsPage.serviceErrorHeading).toHaveText(/Sorry, there is a problem with the service/);
  });
});
