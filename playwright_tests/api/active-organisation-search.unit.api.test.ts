import { expect, test } from '@playwright/test';
import {
  activeSearchFailureMessage,
  activeSearchUnavailableTimeoutMessage,
  isActiveOrganisationSearchRequest,
  ACTIVE_SEARCH_FAILURE_MARKER
} from '../helpers/active-organisation-search';

const searchBody = (searchFilter: string) => () => ({ searchRequest: { search_filter: searchFilter } });
const activeUrl = 'https://ao.example.test/api/organisations?status=ACTIVE';

test.describe('active organisation search contract', () => {
  test('matches only the ACTIVE search POST for the requested term', () => {
    expect(isActiveOrganisationSearchRequest({ method: 'POST', url: activeUrl, postData: searchBody('Test') }, 'Test')).toBe(true);
    expect(isActiveOrganisationSearchRequest({ method: 'POST', url: activeUrl, postData: searchBody('Other') }, 'Test')).toBe(false);
    expect(isActiveOrganisationSearchRequest({ method: 'POST', url: activeUrl, postData: () => null }, 'Test')).toBe(false);
    expect(
      isActiveOrganisationSearchRequest(
        { method: 'POST', url: 'https://ao.example.test/api/organisations?status=PENDING', postData: searchBody('Test') },
        'Test'
      )
    ).toBe(false);
  });

  test('does not read the request body until method and path match, and tolerates non-JSON bodies', () => {
    const throwingBody = () => {
      throw new Error('POST data is not a valid JSON object');
    };
    let reads = 0;
    const countingBody = () => {
      reads += 1;
      return throwingBody();
    };

    expect(isActiveOrganisationSearchRequest({ method: 'GET', url: activeUrl, postData: countingBody }, 'Test')).toBe(false);
    expect(
      isActiveOrganisationSearchRequest({ method: 'POST', url: 'https://ao.example.test/api/pbaAccounts?status=ACTIVE', postData: countingBody }, 'Test')
    ).toBe(false);
    expect(reads).toBe(0);
    expect(isActiveOrganisationSearchRequest({ method: 'POST', url: activeUrl, postData: countingBody }, 'Test')).toBe(false);
    expect(reads).toBe(1);
  });

  test('reports gateway statuses without attributing their cause', () => {
    for (const status of [502, 503, 504]) {
      expect(activeSearchFailureMessage({ status })).toBe(
        `${ACTIVE_SEARCH_FAILURE_MARKER} Active organisation search returned HTTP ${status}`
      );
    }
  });

  test('reports an upstream status when present without attributing its cause', () => {
    expect(activeSearchFailureMessage({ status: 500, body: { apiStatusCode: 503, apiError: 'Service Unavailable' } })).toBe(
      `${ACTIVE_SEARCH_FAILURE_MARKER} Active organisation search returned HTTP 500 with upstream HTTP 503`
    );

    for (const body of [undefined, 'Internal Server Error', { apiError: 'Organisation service request failed' }, { apiStatusCode: 400 }]) {
      const message = activeSearchFailureMessage({ status: 500, body });
      expect(message, JSON.stringify(body)).toBe(
        `${ACTIVE_SEARCH_FAILURE_MARKER} Active organisation search returned HTTP 500`
      );
    }
  });

  test('leaves non-5xx statuses to the ordinary HTTP 200 assertion', () => {
    for (const status of [200, 400, 401, 403, 404, 429, 600]) {
      expect(activeSearchFailureMessage({ status }), `HTTP ${status}`).toBeUndefined();
    }
  });

  test('reports a timeout without attributing its cause', () => {
    expect(activeSearchUnavailableTimeoutMessage(40_000)).toBe(
      `${ACTIVE_SEARCH_FAILURE_MARKER} Active organisation search did not respond within 40000ms`
    );
  });
});
