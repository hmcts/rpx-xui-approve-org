import type { ConsoleMessage, Page, Request, Response, TestInfo } from '@playwright/test';
import {
  classifyFailure,
  classifyFailureCategory,
  collectDependencySignals,
  hasNetworkErrorSignal,
  sanitizeUrl,
  type ApiError,
  type FailedRequest,
  type SlowCall,
} from './failureClassification';

const slowCallThresholdMs = Number.parseInt(process.env.PW_ODHIN_SLOW_CALL_MS || '5000', 10);
const maxTrackedArtifacts = Number.parseInt(process.env.PW_ODHIN_MAX_DIAGNOSTIC_CALLS || '20', 10);

export type FailureDiagnosticsTracker = {
  attachIfFailed: (testInfo: TestInfo) => Promise<void>;
  detach: () => void;
};

function safeSanitizedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return sanitizeUrl(url || 'unavailable');
  }
}

function isBackendApi(url: string): boolean {
  return (
    (url.includes('/api/') || url.includes('/oauth2/') || url.includes('/auth/')) && !url.includes('.js') && !url.includes('.css')
  );
}

function extractPrimaryError(testInfo: TestInfo): string {
  return testInfo.errors
    .map((error) => error.message || error.value || '')
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function extractFailureLocation(errorMessage: string): string {
  const location = errorMessage.match(/at\s+.*\((.*:\d+:\d+)\)/)?.[1] || errorMessage.match(/at\s+(.*:\d+:\d+)/)?.[1];
  return location || 'unavailable';
}

function buildLikelyRootCause(
  failureType: string,
  dependencySignals: string[],
  slowCalls: SlowCall[],
  failedRequests: FailedRequest[],
  errorMessage: string
): string {
  if (failureType === 'DOWNSTREAM_API_5XX') {
    return `Downstream API 5xx likely caused the failure (${dependencySignals[0] || 'server error observed'})`;
  }
  if (failureType === 'DOWNSTREAM_API_4XX') {
    return `Downstream API 4xx likely blocked the workflow (${dependencySignals[0] || 'client error observed'})`;
  }
  if (failureType === 'SLOW_API_RESPONSE') {
    const slowestCall = [...slowCalls].sort((left, right) => right.duration - left.duration)[0];
    return slowestCall
      ? `Backend latency likely caused the timeout (${slowestCall.method} ${slowestCall.url} ${Math.round(slowestCall.duration)}ms)`
      : 'Backend latency likely caused the timeout';
  }
  if (failureType === 'NETWORK_TIMEOUT') {
    return failedRequests[0]
      ? `Network/backend request failed during the journey (${failedRequests[0].method} ${failedRequests[0].url}: ${failedRequests[0].errorText})`
      : 'Network/backend timeout or request failure likely caused the timeout';
  }
  if (failureType === 'UI_ELEMENT_MISSING') {
    return 'UI readiness/element availability issue with no dominant backend failure signal';
  }
  if (errorMessage.toLowerCase().includes('timeout')) {
    return 'Global timeout reached without a stronger backend failure signal';
  }
  return 'No dominant root cause identified; inspect failure diagnosis, trace, and screenshot';
}

async function attachFailureDiagnosis(
  testInfo: TestInfo,
  pageUrl: string,
  apiErrors: ApiError[],
  failedRequests: FailedRequest[],
  slowCalls: SlowCall[],
  consoleErrors: string[],
  networkFailureSignal: boolean
) {
  const errorMessage = extractPrimaryError(testInfo);
  const serverErrors = apiErrors.filter((entry) => entry.status >= 500);
  const clientErrors = apiErrors.filter((entry) => entry.status >= 400 && entry.status < 500);
  const failureType = classifyFailure(errorMessage, serverErrors, clientErrors, slowCalls, failedRequests, networkFailureSignal);
  const dependencySignals = collectDependencySignals(
    errorMessage,
    serverErrors,
    clientErrors,
    slowCalls,
    failedRequests,
    networkFailureSignal
  );
  const failureCategory = classifyFailureCategory(failureType, dependencySignals);
  const failureLocation = extractFailureLocation(errorMessage);
  const likelyRootCause = buildLikelyRootCause(failureType, dependencySignals, slowCalls, failedRequests, errorMessage);
  const slowSummary = slowCalls
    .slice()
    .sort((left, right) => right.duration - left.duration)
    .slice(0, 3)
    .map((entry) => `${entry.method} ${entry.url} ${Math.round(entry.duration)}ms`)
    .join(' | ');
  const failedSummary = failedRequests
    .slice(0, 3)
    .map((entry) => `${entry.method} ${entry.url} (${entry.errorText})`)
    .join(' | ');
  const apiSummary = [...serverErrors, ...clientErrors]
    .slice(0, 3)
    .map((entry) => `${entry.method} ${entry.url} (${entry.status})`)
    .join(' | ');

  testInfo.annotations.push(
    { type: 'Failure type', description: failureType },
    { type: 'Failure category', description: failureCategory },
    { type: 'Likely root cause', description: likelyRootCause },
    { type: 'Failure location', description: failureLocation }
  );

  if (dependencySignals.length > 0) {
    testInfo.annotations.push({ type: 'Dependency signals', description: dependencySignals.join(' | ').slice(0, 800) });
  }
  if (apiSummary) {
    testInfo.annotations.push({ type: 'API errors (details)', description: apiSummary.slice(0, 800) });
  }
  if (failedSummary) {
    testInfo.annotations.push({ type: 'Failed backend requests', description: failedSummary.slice(0, 800) });
  }
  if (slowSummary) {
    testInfo.annotations.push({ type: 'Slow backend calls', description: slowSummary.slice(0, 800) });
  }

  const diagnosis = [
    `Status: ${testInfo.status}`,
    `Expected status: ${testInfo.expectedStatus}`,
    `URL: ${pageUrl}`,
    `Failure type: ${failureType}`,
    `Failure category: ${failureCategory}`,
    `Likely root cause: ${likelyRootCause}`,
    `Failure location: ${failureLocation}`,
    dependencySignals.length ? `Dependency signals: ${dependencySignals.join(' | ')}` : '',
    apiSummary ? `API errors: ${apiSummary}` : '',
    failedSummary ? `Failed backend requests: ${failedSummary}` : '',
    slowSummary ? `Slow backend calls: ${slowSummary}` : '',
    consoleErrors.length ? `Console errors: ${consoleErrors.slice(0, 10).join(' | ')}` : '',
    '',
    errorMessage,
  ]
    .filter(Boolean)
    .join('\n');

  await testInfo.attach('failure-diagnosis', {
    body: Buffer.from(diagnosis),
    contentType: 'text/plain',
  });

  await testInfo.attach('failure-data.json', {
    body: Buffer.from(
      JSON.stringify(
        {
          url: pageUrl,
          status: testInfo.status,
          expectedStatus: testInfo.expectedStatus,
          failureType,
          failureCategory,
          likelyRootCause,
          failureLocation,
          dependencySignals,
          serverErrors,
          clientErrors,
          failedRequests,
          slowCalls,
          consoleErrors,
          errorMessage,
        },
        null,
        2
      )
    ),
    contentType: 'application/json',
  });
}

export function createFailureDiagnosticsTracker(page: Page): FailureDiagnosticsTracker {
  const apiErrors: ApiError[] = [];
  const failedRequests: FailedRequest[] = [];
  const slowCalls: SlowCall[] = [];
  const consoleErrors: string[] = [];
  let networkFailureSignal = false;

  const responseHandler = async (response: Response) => {
    const url = response.url();
    if (!isBackendApi(url)) {
      return;
    }

    const status = response.status();
    if (status >= 400) {
      apiErrors.push({
        url: sanitizeUrl(url),
        status,
        method: response.request().method(),
      });
      if (apiErrors.length > maxTrackedArtifacts) {
        apiErrors.shift();
      }
    }
  };

  const requestFinishedHandler = (request: Request) => {
    const url = request.url();
    if (!isBackendApi(url)) {
      return;
    }

    const timing = request.timing();
    if (timing.responseEnd !== -1 && timing.responseEnd > slowCallThresholdMs) {
      slowCalls.push({
        url: sanitizeUrl(url),
        duration: timing.responseEnd,
        method: request.method(),
      });
      if (slowCalls.length > maxTrackedArtifacts) {
        slowCalls.shift();
      }
    }
  };

  const requestFailedHandler = (request: Request) => {
    const url = request.url();
    if (!isBackendApi(url)) {
      return;
    }

    const errorText = request.failure()?.errorText ?? 'Unknown request failure';
    failedRequests.push({
      url: sanitizeUrl(url),
      method: request.method(),
      errorText,
    });
    if (failedRequests.length > maxTrackedArtifacts) {
      failedRequests.shift();
    }
    if (hasNetworkErrorSignal(errorText)) {
      networkFailureSignal = true;
    }
  };

  const consoleHandler = (message: ConsoleMessage) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
      if (consoleErrors.length > maxTrackedArtifacts) {
        consoleErrors.shift();
      }
    }
  };

  page.on('response', responseHandler);
  page.on('requestfinished', requestFinishedHandler);
  page.on('requestfailed', requestFailedHandler);
  page.on('console', consoleHandler);

  return {
    attachIfFailed: async (testInfo: TestInfo) => {
      if (testInfo.status === testInfo.expectedStatus) {
        return;
      }

      await attachFailureDiagnosis(
        testInfo,
        safeSanitizedUrl(page.url()),
        apiErrors,
        failedRequests,
        slowCalls,
        consoleErrors,
        networkFailureSignal
      );
    },
    detach: () => {
      page.off('response', responseHandler);
      page.off('requestfinished', requestFinishedHandler);
      page.off('requestfailed', requestFailedHandler);
      page.off('console', consoleHandler);
    },
  };
}
