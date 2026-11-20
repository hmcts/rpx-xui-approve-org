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

  for (const scenario of [
    { name: 'normal recovery', serviceFailures: 1 },
    { name: 'repeated service-down recovery', serviceFailures: 2 }
  ]) {
    test(`recovers after ${scenario.name}`, async ({ page }) => {
      let navigationCount = 0;
      await page.route('http://example.test/organisation/pending', async (route) => {
        navigationCount += 1;
        const serviceDown = navigationCount <= scenario.serviceFailures;
        await route.fulfill({
          contentType: 'text/html',
          body: serviceDown
            ? '<main><h1>Sorry, there is a problem with the service</h1></main>'
            : '<app-pending-overview-component style="display:block;height:1px"></app-pending-overview-component><div class="search-organisations-form"><form><input id="search"><button class="hmcts-search__button" type="button">Search</button></form></div>'
        });
      });

      await page.goto('http://example.test/organisation/pending');
      const organisationApprovalsPage = new OrganisationApprovalsPage(page);
      await organisationApprovalsPage.searchForOrganisationWithTransientRecovery('Test organisation');

      expect(navigationCount).toBe(scenario.serviceFailures + 1);
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
      await expect(organisationApprovalsPage.serviceErrorHeading).toHaveCount(0);
    });
  }

  test('detects a service-down page that appears after recovery navigation', async ({ page }) => {
    let navigationCount = 0;
    await page.route('http://example.test/organisation/pending', async (route) => {
      navigationCount += 1;
      const body = navigationCount === 1
        ? '<h1>Sorry, there is a problem with the service</h1>'
        : navigationCount === 2
          ? '<script>setTimeout(() => document.body.innerHTML = "<h1>Sorry, there is a problem with the service</h1>", 1_100)</script>'
          : '<app-pending-overview-component style="display:block;height:1px"></app-pending-overview-component><div class="search-organisations-form"><form><input id="search"><button class="hmcts-search__button" type="button">Search</button></form></div>';
      await route.fulfill({ contentType: 'text/html', body });
    });

    await page.goto('http://example.test/organisation/pending');
    const organisationApprovalsPage = new OrganisationApprovalsPage(page);
    await organisationApprovalsPage.searchForOrganisationWithTransientRecovery('Test organisation');

    expect(navigationCount).toBe(3);
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
  });

  test('fails explicitly after bounded recovery attempts are exhausted', async ({ page }) => {
    let navigationCount = 0;
    await page.route('http://example.test/organisation/pending', async (route) => {
      navigationCount += 1;
      await route.fulfill({
        contentType: 'text/html',
        body: '<h1>Sorry, there is a problem with the service</h1>'
      });
    });

    await page.goto('http://example.test/organisation/pending');
    const organisationApprovalsPage = new OrganisationApprovalsPage(page);
    await expect(
      organisationApprovalsPage.searchForOrganisationWithTransientRecovery('Test organisation')
    ).rejects.toThrow('Organisation search remained unavailable after 3 attempts.');
    expect(navigationCount).toBe(3);
  });

  test('waits for the loading spinner to clear before clicking a tab', async ({ page }) => {
    await page.setContent(`
      <div class="govuk-tabs"><a class="govuk-tabs__tab" href="#pbas">New PBAs</a></div>
      <xuilib-loading-spinner><div class="spinner-container" style="position:fixed;inset:0;background:#fff"></div></xuilib-loading-spinner>
    `);
    await page.locator('a.govuk-tabs__tab').evaluate((tab) => {
      tab.setAttribute('href', '/organisation/pbas');
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        document.body.insertAdjacentHTML('beforeend', '<app-pending-pbas style="display:block;height:1px"></app-pending-pbas>');
      });
      window.setTimeout(() => document.querySelector('xuilib-loading-spinner')!.remove(), 1_000);
    });
    // A bare click would exhaust this action budget while the overlay intercepts pointer events.
    page.setDefaultTimeout(250);

    await new OrganisationApprovalsPage(page).openNewPbasTab();

    await expect(page.locator('app-pending-pbas')).toHaveCount(1);
  });

  test('refuses to click a tab while the service-error page is shown', async ({ page }) => {
    await page.setContent(`
      <h1>Sorry, there is a problem with the service</h1>
      <div class="govuk-tabs"><a class="govuk-tabs__tab" href="/organisation/active">Active organisations</a></div>
    `);

    await expect(new OrganisationApprovalsPage(page).openActiveOrganisationsTab()).rejects.toThrow(
      'Cannot open the Active organisations tab because the current view shows: Sorry, there is a problem with the service'
    );
  });

  const activeSearchPage = (spinnerMs = 0) => `
    <div class="search-organisations-form"><form><input id="search"><button class="hmcts-search__button" type="button">Search</button></form></div>
    ${spinnerMs ? `<xuilib-loading-spinner><div class="spinner-container" style="position:fixed;inset:0"></div></xuilib-loading-spinner>
      <script>setTimeout(() => document.querySelector('xuilib-loading-spinner').remove(), ${spinnerMs})</script>` : ''}
    <script>
      document.querySelector('button').addEventListener('click', () => {
        fetch('/api/organisations?status=ACTIVE', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ searchRequest: { search_filter: document.querySelector('#search').value } })
        }).catch(() => undefined);
      });
    </script>`;

  for (const scenario of [
    {
      name: 'a gateway 504',
      reply: { status: 504, body: 'Gateway Timeout' },
      expected: '[ACTIVE_ORGANISATION_SEARCH_FAILURE] Active organisation search returned HTTP 504'
    },
    {
      name: 'a node-layer 500 relaying an upstream 503',
      reply: { status: 500, contentType: 'application/json', body: JSON.stringify({ apiStatusCode: 503, apiError: 'Service Unavailable' }) },
      expected: '[ACTIVE_ORGANISATION_SEARCH_FAILURE] Active organisation search returned HTTP 500 with upstream HTTP 503'
    },
    {
      name: 'a node-layer 500 without an upstream status',
      reply: { status: 500, contentType: 'application/json', body: JSON.stringify({ apiError: 'Organisation service request failed' }) },
      expected: '[ACTIVE_ORGANISATION_SEARCH_FAILURE] Active organisation search returned HTTP 500'
    },
    {
      name: 'no response in time',
      reply: undefined,
      expected: '[ACTIVE_ORGANISATION_SEARCH_FAILURE] Active organisation search did not respond within 500ms'
    }
  ]) {
    test(`fails an active search once on ${scenario.name}`, async ({ page }) => {
      let searchCalls = 0;
      await page.route((url) => url.pathname === '/api/organisations', async (route) => {
        searchCalls += 1;
        if (scenario.reply) {
          await route.fulfill(scenario.reply);
        }
      });
      await page.route('http://example.test/organisation/active', (route) => route.fulfill({ contentType: 'text/html', body: activeSearchPage() }));
      await page.goto('http://example.test/organisation/active');

      await expect(new OrganisationApprovalsPage(page).searchActiveOrganisations('Test', 500)).rejects.toThrow(scenario.expected);
      expect(searchCalls).toBe(1);
    });
  }

  test('passes an active search that returns HTTP 200', async ({ page }) => {
    await page.route((url) => url.pathname === '/api/organisations', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ organisations: [], total_records: 0 })
    }));
    await page.route('http://example.test/organisation/active', (route) => route.fulfill({ contentType: 'text/html', body: activeSearchPage() }));
    await page.goto('http://example.test/organisation/active');

    await new OrganisationApprovalsPage(page).searchActiveOrganisations('Test', 5_000);
  });

  test('does not charge UI readiness time to the active search response budget', async ({ page }) => {
    await page.route((url) => url.pathname === '/api/organisations', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ organisations: [], total_records: 0 }) });
    });
    // The spinner outlasts the whole response budget; only the POST itself must fit inside it.
    await page.route('http://example.test/organisation/active', (route) => route.fulfill({ contentType: 'text/html', body: activeSearchPage(1_500) }));
    await page.goto('http://example.test/organisation/active');

    await new OrganisationApprovalsPage(page).searchActiveOrganisations('Test', 1_000);
  });

  test('keeps waiting while any one of several spinner overlays is visible', async ({ page }) => {
    await page.setContent(`
      <xuilib-loading-spinner><div class="spinner-container" style="display:none"></div></xuilib-loading-spinner>
      <xuilib-loading-spinner id="live"><div class="spinner-container" style="width:10px;height:10px"></div></xuilib-loading-spinner>
    `);
    const organisationApprovalsPage = new OrganisationApprovalsPage(page);

    await expect(organisationApprovalsPage.waitForSpinnerToHide(500)).rejects.toThrow('Loading spinner still visible after 500ms');

    await page.locator('#live').evaluate((element) => element.remove());
    await organisationApprovalsPage.waitForSpinnerToHide(500);
  });
});
