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
  test('adds status filters for failed, timed out, flaky and retried outcomes', () => {
    const nextHtml = enhancerTest.enhanceDashboardHtml(
      `<html><head></head><body>
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
    const filters = root.querySelector('#odhin-test-status-filter');

    expect(filters?.text).toContain('Failed (1)');
    expect(filters?.text).toContain('Timed out (1)');
    expect(filters?.text).toContain('Flaky (1)');
    expect(filters?.querySelector('[data-odhin-test-status-filter="^(timedout|timed out)$"]')).toBeTruthy();
    expect(root.querySelector('#odhin-test-status-filter-script')?.text).toContain('table.column(1).search');
  });

  test('injects a non-destructive runtime status filter when parsing cannot safely serialise a report', () => {
    const source = '<html><body><table id="test-list-table"></table></body></html>';
    const nextHtml = enhancerTest.injectRuntimeTestStatusFilters(source);

    expect(nextHtml).toContain('id="odhin-test-status-filter-runtime"');
    expect(nextHtml).toContain("window.addEventListener('load'");
    expect(nextHtml).toContain("DataTable().column(1).search");
    expect(nextHtml).toContain('Timed out');
    expect(nextHtml).toContain('</body>');
  });

  test('keeps the original report when its source table markup is not parsed', () => {
    const malformedReport = '<html><body><script type="text/x-odhin-fragment"><table id="test-list-table"><tr><td>unclosed Odhín fragment</td></tr></script></body></html>';
    const nextHtml = enhancerTest.enhanceDashboardHtml(malformedReport, []);

    expect(nextHtml).toContain('unclosed Odhín fragment');
    expect(nextHtml).toContain('id="odhin-test-status-filter-runtime"');
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
});
