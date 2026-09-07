import { expect, test } from '@playwright/test';
import { parse } from 'node-html-parser';

import enhancerModule from '../common/reporters/odhin-report-enhancer.cjs';

const enhancerTest = (enhancerModule as {
  __test__: {
    enhanceDashboardHtml: (html: string, featureStats: unknown, evidenceEntries?: unknown) => string;
    injectRuntimeTestStatusFilters: (html: string) => string;
  };
}).__test__;

test.describe('odhin report enhancer', () => {
  test('preserves the native Odhín status selector without adding a second filter', () => {
    const nextHtml = enhancerTest.enhanceDashboardHtml(
      `<html><head></head><body>
        <div id="status-filter-row"><label for="status-filter">Status</label><select id="status-filter"><option value="">All</option></select></div>
        <table id="test-list-table"><thead><tr><th>Title</th><th>Status</th></tr></thead><tbody>
          <tr><td>failed test</td><td>failed</td></tr>
          <tr><td>timeout test</td><td>timedOut</td></tr>
          <tr><td>flaky test</td><td>flaky</td></tr>
          <tr><td>retried pass</td><td>passed</td></tr>
        </tbody></table>
      </body></html>`,
      []
    );

    const root = parse(nextHtml);
    expect(root.querySelector('#status-filter')?.text).toContain('All');
    expect(root.querySelector('#odhin-test-status-filter')).toBeNull();
  });

  test('places an injected status selector below the DataTables entries control', async ({ page }) => {
    const nextHtml = enhancerTest.enhanceDashboardHtml(
      `<html><head><style>.dataTables_length { float: left; }</style></head><body><div id="TabTests" class="main-tabcontent"><div class="dataTables_length">Show 100 entries</div><table id="test-list-table"><thead><tr><th>Title</th><th>Status</th></tr></thead><tbody>
        <tr><td>passing result</td><td>Passed</td></tr>
        <tr><td>failing result</td><td>Failed</td></tr>
      </tbody></table></div></body></html>`,
      []
    );

    await page.setContent(nextHtml);

    await expect(page.getByLabel('Status')).toHaveValue('');
    await expect(page.locator('#status-filter-row')).toHaveCSS('clear', 'both');
    await expect(page.locator('#status-filter-row')).toHaveCSS('margin-top', '16px');
    expect((await page.locator('#status-filter-row').boundingBox())?.y).toBeGreaterThan(
      (await page.locator('.dataTables_length').boundingBox())?.y ?? 0
    );
    await page.getByLabel('Status').selectOption('failed');
    await expect(page.locator('#test-list-table tbody tr').filter({ hasText: 'passing result' })).toBeHidden();
    await expect(page.locator('#test-list-table tbody tr').filter({ hasText: 'failing result' })).toBeVisible();
  });

  test('keeps the fallback status selector below a floating entries control', async ({ page }) => {
    const nextHtml = enhancerTest.injectRuntimeTestStatusFilters(
      `<html><head><style>.dataTables_length { float: left; }</style></head><body>
        <div class="dataTables_length">Show 100 entries</div>
        <table id="test-list-table"><tbody><tr><td>result</td><td>Passed</td></tr></tbody></table>
      </body></html>`
    );

    await page.setContent(nextHtml);

    await expect(page.getByLabel('Status')).toHaveValue('');
    await expect(page.locator('#status-filter-row')).toHaveCSS('clear', 'both');
    expect((await page.locator('#status-filter-row').boundingBox())?.y).toBeGreaterThan(
      (await page.locator('.dataTables_length').boundingBox())?.y ?? 0
    );
  });

  test('injects a non-destructive native status selector when parsing cannot safely serialise a report', () => {
    const source = '<html><body><table id="test-list-table"></table></body></html>';
    const nextHtml = enhancerTest.injectRuntimeTestStatusFilters(source);

    expect(nextHtml).toContain('id="odhin-test-status-filter-runtime"');
    expect(nextHtml).toContain('window.addEventListener(\'load\'');
    expect(nextHtml).toContain('filter.id = \'status-filter\'');
    expect(nextHtml).toContain('label.textContent = \'Status\'');
    expect(nextHtml).not.toContain('odhin-test-status-filter-runtime-style');
    expect(nextHtml).toContain('</body>');
  });

  test('recovers a usable test table when its source markup is not parsed', async ({ page }) => {
    const malformedReport = `
      <html><body><div id="TabTests" class="main-tabcontent"></div><script type="text/x-odhin-fragment">
        <table id="test-list-table"><thead><tr><th>Title</th><th>Status</th></tr></thead><tbody>
          <tr><td>passing result</td><td>Passed</td></tr>
          <tr><td>failing result</td><td>Failed</td></tr>
        </tbody>
    </script></body></html>`;
    const nextHtml = enhancerTest.enhanceDashboardHtml(malformedReport, []);

    page.on('pageerror', (error) => {
      throw error;
    });
    await page.setContent(nextHtml);

    await expect(page.locator('#TabTests #odhin-recovered-tests #test-list-table')).toBeVisible();
    await page.getByLabel('Status').selectOption('failed');
    await expect(page.locator('#TabTests #odhin-recovered-tests tbody tr').filter({ hasText: 'passing result' })).toBeHidden();
    await expect(page.locator('#TabTests #odhin-recovered-tests tbody tr').filter({ hasText: 'failing result' })).toBeVisible();
  });

  test('repairs escaped Tests tab content and orphaned failed modal fragments', () => {
    const failedModalId = 'run-id-failed-0';
    const accessibilityAssertion = `[a11y] Failed page
A11Y_STRICT is disabled, so Jenkins marks the accessibility stage unstable instead of failed.
[
  {
    "engine": "axe",
    "status": "issues-found"
  }
]`;
    const html = `
      <html lang="en">
        <head></head>
        <div id="TabDashboard" class="main-tabcontent">
          <div class="dashboard-block">dashboard</div>
        </div>
        <div id="TabTests" class="main-tabcontent"></div>
        <div>
          <div class="table-responsive">
            <table id="test-list-table">
              <thead>
                <tr><th>Title</th><th>Status</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr data-bs-toggle="modal" data-bs-target="#${failedModalId}">
                  <td>Viewing a failed accessibility page passes baseline accessibility scan</td>
                  <td>failed</td>
                  <td>1s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-dialog modal-fullscreen modal-dialog-scrollable"></div>
        <div class="modal-header result-header">
          <div class="header-col-left">
            <span class="modal-title fs-5" id="${failedModalId}Label">
              <label class="text-capitalize label-status-failed">failed</label>
            </span>
          </div>
          <div class="header-col-center">
            Viewing a failed accessibility page passes baseline accessibility scan
          </div>
          <div class="header-col-right">
            <span type="button" class="close-btn" data-bs-dismiss="modal">X</span>
          </div>
        </div>
        <div class="modal-header result-tab-header">
          <div class="tab">
            <button class="result-tablinks-${failedModalId} active">Info</button>
            <button class="result-tablinks-${failedModalId}">Steps</button>
          </div>
        </div>
        <div class="modal-body odhin-bg-2">
          <div id="TabRunInfo-${failedModalId}" style="display: block" class="result-tabcontent">
            run info
            <table>
              <tbody>
                <tr>
                  <td>Actionable error</td>
                  <td><pre>${accessibilityAssertion}</pre></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="row m-0 p-0">
          escaped steps wrapper
          <div class="accordion-item">
            <h2 class="accordion-header">failed step</h2>
            <div class="accordion-body">
              <p class="stepLine">${accessibilityAssertion}</p>
            </div>
          </div>
        </div>
        <div id="TabErrors-${failedModalId}" style="display: none" class="result-tabcontent">
          <pre>${accessibilityAssertion}</pre>
        </div>
      </html>
    `;

    const nextHtml = enhancerTest.enhanceDashboardHtml(
      html,
      [],
      [
        {
          engine: 'axe',
          testTitle: 'Viewing a failed accessibility page passes baseline accessibility scan',
          htmlFileName: 'failed-page-axe.html',
          jsonFileName: 'failed-page-axe.json',
          screenshotFileName: 'failed-page-axe-highlighted-screenshot.png',
          violationCount: 1,
          status: 'issues-found',
          rules: ['definition-list'],
          targets: ['dl']
        },
        {
          engine: 'wave-like',
          testTitle: 'Viewing a failed accessibility page passes baseline accessibility scan',
          htmlFileName: 'passed-page-wave-like.html',
          jsonFileName: 'passed-page-wave-like.json',
          screenshotFileName: 'passed-page-wave-like-highlighted-screenshot.png',
          violationCount: 0,
          status: 'passed',
          rules: [],
          targets: []
        }
      ]
    );

    const root = parse(nextHtml);
    const testsTab = root.querySelector('#TabTests');
    const failedModal = root.querySelector(`#${failedModalId}`);

    expect(root.querySelector('#TabDashboard #test-list-table')).toBeNull();
    expect(testsTab?.querySelector('#test-list-table')).toBeTruthy();
    expect(testsTab?.querySelector('.odhin-a11y-issue-summary')).toBeTruthy();
    expect(failedModal?.getAttribute('class')).toContain('modal');
    expect(failedModal?.querySelector('.modal-content .result-header')).toBeTruthy();
    expect(failedModal?.querySelector('.odhin-a11y-test-evidence')).toBeTruthy();
    expect(failedModal?.querySelector('.odhin-a11y-test-evidence')?.toString()).toContain(
      'Accessibility stage unstable'
    );
    expect(failedModal?.querySelector('.odhin-a11y-test-evidence')?.toString()).toContain(
      'failed-page-axe-highlighted-screenshot.png'
    );
    expect(failedModal?.querySelector('.odhin-a11y-test-evidence')?.toString()).not.toContain(
      'passed-page-wave-like-highlighted-screenshot.png'
    );
    expect(failedModal?.querySelector('.modal-body #TabSteps-run-id-failed-0')).toBeTruthy();
    expect(failedModal?.querySelector('.modal-body #TabSteps-run-id-failed-0')?.getAttribute('class')).toContain(
      'result-tabcontent-run-id-failed-0'
    );
    expect(failedModal?.querySelector('.modal-body #TabSteps-run-id-failed-0')?.text).toContain('escaped steps wrapper');
    expect(failedModal?.querySelector('.modal-body #TabSteps-run-id-failed-0')?.text).not.toContain('[a11y]');
    expect(failedModal?.querySelector('.modal-body #TabRunInfo-run-id-failed-0')?.text).not.toContain('[a11y]');
    expect(failedModal?.querySelector('.modal-body #TabErrors-run-id-failed-0')).toBeTruthy();
    expect(failedModal?.querySelector('.modal-body #TabErrors-run-id-failed-0')?.getAttribute('class')).toContain(
      'result-tabcontent-run-id-failed-0'
    );
    expect(failedModal?.querySelector('.modal-body #TabErrors-run-id-failed-0')?.text).toContain(
      'Accessibility issues found for "Failed page".'
    );
    expect(failedModal?.querySelector('.modal-body #TabErrors-run-id-failed-0')?.text).toContain(
      'Open the accessibility evidence links'
    );
    expect(failedModal?.querySelector('.modal-body #TabErrors-run-id-failed-0')?.text).not.toContain('[a11y]');
    expect(failedModal?.querySelector('.modal-body #TabErrors-run-id-failed-0')?.text).not.toContain('"engine"');
    expect(failedModal?.querySelector('.modal-body > .row.m-0.p-0')).toBeNull();
    expect(
      root.querySelectorAll('.modal-dialog').filter((dialog) => !dialog.closest('.modal'))
    ).toHaveLength(0);
  });

  test('moves only the test-table wrapper into the Tests tab without inlining sibling modal content', () => {
    const modalId = 'safe-modal-id';
    const nextHtml = enhancerTest.enhanceDashboardHtml(
      `<html><head></head><body>
        <div id="TabTests" class="main-tabcontent"></div>
        <div class="container-fluid">
          <div class="table-responsive">
            <table id="test-list-table"><thead><tr><th>Title</th><th>Status</th></tr></thead><tbody>
              <tr data-bs-target="#${modalId}"><td>test title</td><td>passed</td></tr>
            </tbody></table>
          </div>
          <div class="modal" id="${modalId}"><div class="modal-content">modal detail</div></div>
        </div>
      </body></html>`,
      []
    );

    const root = parse(nextHtml);
    const testsTab = root.querySelector('#TabTests');
    const modal = root.querySelector(`#${modalId}`);

    expect(testsTab?.querySelector('.table-responsive #test-list-table')).toBeTruthy();
    expect(testsTab?.querySelector('.modal')).toBeNull();
    expect(modal?.parentNode?.getAttribute('class')).toContain('container-fluid');
    expect(modal?.text).toContain('modal detail');
  });

  test('removes the Tests heading and table from Dashboard when the report is well formed', () => {
    const nextHtml = enhancerTest.enhanceDashboardHtml(
      `<html><head></head><body>
        <div id="TabDashboard"><h2>Tests</h2><div class="table-responsive"><table id="test-list-table"><tbody><tr><td>title</td><td>Passed</td></tr></tbody></table></div></div>
        <div id="TabTests" class="main-tabcontent"></div>
      </body></html>`,
      []
    );

    const root = parse(nextHtml);
    const dashboard = root.querySelector('#TabDashboard');
    const testsTab = root.querySelector('#TabTests');

    expect(dashboard?.text).not.toContain('Tests');
    expect(dashboard?.querySelector('#test-list-table')).toBeNull();
    expect(testsTab?.querySelector('h2')?.text).toBe('Tests');
    expect(testsTab?.querySelector('#test-list-table')).toBeTruthy();
  });

  test('moves browser-parsed fallback test content from Dashboard into Tests', async ({ page }) => {
    const nextHtml = enhancerTest.injectRuntimeTestStatusFilters(
      `<html><body>
        <div id="TabDashboard"><h2>Tests</h2><div class="table-responsive"><table id="test-list-table"><tbody><tr><td>title</td><td>Passed</td></tr></tbody></table></div></div>
        <div id="TabTests" class="main-tabcontent"></div>
      </body></html>`
    );

    await page.setContent(nextHtml);
    await expect(page.locator('#TabTests #test-list-table')).toBeVisible();
    await expect(page.locator('#TabTests').getByRole('heading', { name: 'Tests' })).toBeVisible();
    await expect(page.locator('#TabDashboard #test-list-table')).toHaveCount(0);
    await expect(page.locator('#TabDashboard').getByRole('heading', { name: 'Tests' })).toHaveCount(0);
  });

  test('moves fallback test content even when the original report already has filters', async ({ page }) => {
    const nextHtml = enhancerTest.injectRuntimeTestStatusFilters(
      `<html><body>
        <div id="TabDashboard"><h2>Tests</h2><div class="table-responsive"><table id="test-list-table"><tbody><tr><td>title</td><td>Passed</td></tr></tbody></table></div></div>
        <div id="TabTests" class="main-tabcontent"></div>
        <div id="odhin-test-status-filter"></div>
      </body></html>`
    );

    await page.setContent(nextHtml);

    await expect(page.locator('#TabTests #test-list-table')).toBeVisible();
    await expect(page.locator('#TabDashboard #test-list-table')).toHaveCount(0);
    await expect(page.locator('#TabDashboard').getByRole('heading', { name: 'Tests' })).toHaveCount(0);
  });

  test('removes an orphaned recovered list when the Tests tab already has its table', async ({ page }) => {
    const nextHtml = enhancerTest.injectRuntimeTestStatusFilters(
      `<html><body>
        <div id="TabTests" class="main-tabcontent"><div class="table-responsive"><table id="test-list-table"><tbody><tr><td>real result</td><td>Passed</td></tr></tbody></table></div></div>
        <section id="odhin-recovered-tests"><h2>Tests</h2><div class="table-responsive"><table id="test-list-table"><tbody><tr><td>duplicate result</td><td>Passed</td></tr></tbody></table></div></section>
      </body></html>`
    );

    await page.setContent(nextHtml);

    await expect(page.locator('#TabTests #test-list-table')).toHaveCount(1);
    await expect(page.locator('#TabTests tbody tr').filter({ hasText: 'real result' })).toBeVisible();
    await expect(page.locator('#odhin-recovered-tests')).toHaveCount(0);
  });
});
