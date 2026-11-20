export const ACTIVE_SEARCH_FAILURE_MARKER = '[ACTIVE_ORGANISATION_SEARCH_FAILURE]';

export type ActiveSearchRequest = {
  method: string;
  url: string;
  /** Read lazily: Playwright's postDataJSON() throws on non-JSON bodies. */
  postData: () => unknown;
};

export type ActiveSearchFailure = {
  status: number;
  /** Parsed JSON body of the failed response, when it had one. */
  body?: unknown;
};

export function isActiveOrganisationSearchRequest(request: ActiveSearchRequest, searchTerm: string): boolean {
  if (request.method !== 'POST') {
    return false;
  }
  const url = new URL(request.url);
  if (url.pathname !== '/api/organisations' || url.searchParams.get('status') !== 'ACTIVE') {
    return false;
  }
  let body: { searchRequest?: { search_filter?: string } } | null;
  try {
    body = request.postData() as typeof body;
  } catch {
    return false;
  }
  return body?.searchRequest?.search_filter === searchTerm;
}

function upstreamStatusFrom(body: unknown): number | undefined {
  const apiStatusCode = Number((body as { apiStatusCode?: unknown } | null | undefined)?.apiStatusCode);
  return Number.isInteger(apiStatusCode) ? apiStatusCode : undefined;
}

/**
 * Returns the failure message for a non-2xx active search response, or undefined when the status is not a 5xx
 * (those stay ordinary assertion failures).
 */
export function activeSearchFailureMessage(failure: ActiveSearchFailure): string | undefined {
  const { status, body } = failure;
  if (status < 500 || status > 599) {
    return undefined;
  }
  const upstreamStatus = upstreamStatusFrom(body);
  if (upstreamStatus !== undefined && upstreamStatus >= 500 && upstreamStatus <= 599) {
    return `${ACTIVE_SEARCH_FAILURE_MARKER} Active organisation search returned HTTP ${status} with upstream HTTP ${upstreamStatus}`;
  }
  return `${ACTIVE_SEARCH_FAILURE_MARKER} Active organisation search returned HTTP ${status}`;
}

export function activeSearchUnavailableTimeoutMessage(timeoutMs: number): string {
  return `${ACTIVE_SEARCH_FAILURE_MARKER} Active organisation search did not respond within ${timeoutMs}ms`;
}
