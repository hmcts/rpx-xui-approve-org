import { strict as assert } from 'node:assert';

import {
  classifyFailure,
  classifyFailureCategory,
  sanitizeUrl,
  type ApiError,
  type FailedRequest,
  type SlowCall,
} from '../../../../playwright_tests_new/common/failureClassification';

describe('failureClassification', () => {
  it('classifies server-side API failures as downstream 5xx', () => {
    const serverErrors: ApiError[] = [{ url: 'https://example.test/api/organisations', status: 502, method: 'POST' }];

    assert.equal(classifyFailure('Request failed', serverErrors, [], [], [], false), 'DOWNSTREAM_API_5XX');
  });

  it('classifies timeout failures with slow backend calls as slow API responses', () => {
    const slowCalls: SlowCall[] = [{ url: 'https://example.test/api/organisations', duration: 7250, method: 'GET' }];

    assert.equal(classifyFailure('Test timeout of 180000ms exceeded.', [], [], slowCalls, [], false), 'SLOW_API_RESPONSE');
  });

  it('classifies timeout failures with failed requests as network timeouts when no slow call dominates', () => {
    const failedRequests: FailedRequest[] = [
      { url: 'https://example.test/api/organisations', method: 'POST', errorText: 'socket hang up' },
    ];

    assert.equal(classifyFailure('Test timeout of 180000ms exceeded.', [], [], [], failedRequests, true), 'NETWORK_TIMEOUT');
  });

  it('marks dependency-linked failures as dependency environment failures', () => {
    assert.equal(
      classifyFailureCategory('UNKNOWN', ['Failed backend requests=1 (socket hang up)']),
      'DEPENDENCY_ENVIRONMENT_FAILURE'
    );
  });

  it('sanitizes URLs by dropping query parameters', () => {
    assert.equal(
      sanitizeUrl('https://example.test/api/organisations?status=ACTIVE&size=25'),
      'https://example.test/api/organisations'
    );
  });
});
