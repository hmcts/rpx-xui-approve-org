import type { APIRequestContext } from '@playwright/test';

type SortDirection = 'ASC' | 'DESC';

type SearchSortParameter = {
  sort_by: string;
  sort_order: SortDirection;
};

type SearchPaginationParameter = {
  page_number: number;
  page_size: number;
};

type SearchDrillDownParameter = {
  field_name: string;
  search_filter: string;
};

type OrganisationSearchPayloadOptions = {
  view: 'NEW' | 'ACTIVE';
  searchFilter?: string;
  pageNumber?: number;
  pageSize?: number;
};

type PbaSearchPayloadOptions = {
  view?: 'pending' | 'active';
  searchFilter?: string;
  pageNumber?: number;
  pageSize?: number;
  drillDownSearch?: SearchDrillDownParameter[];
};

const DEFAULT_SORT: SearchSortParameter = {
  sort_by: 'organisationId',
  sort_order: 'ASC'
};

const DEFAULT_PAGE_SIZE = 10;

export const DENIED_HTTP_STATUSES = [302, 401, 403] as const;

function buildPagination(pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE): SearchPaginationParameter {
  return {
    page_number: pageNumber,
    page_size: pageSize
  };
}

export function createOrganisationSearchPayload(options: OrganisationSearchPayloadOptions): Record<string, unknown> {
  return {
    view: options.view,
    searchRequest: {
      search_filter: options.searchFilter ?? '',
      sorting_parameters: [DEFAULT_SORT],
      pagination_parameters: buildPagination(options.pageNumber, options.pageSize)
    }
  };
}

export function createPbaSearchPayload(options: PbaSearchPayloadOptions = {}): Record<string, unknown> {
  return {
    view: options.view ?? 'pending',
    searchRequest: {
      search_filter: options.searchFilter ?? 'active',
      sorting_parameters: [DEFAULT_SORT],
      pagination_parameters: buildPagination(options.pageNumber, options.pageSize),
      drill_down_search: options.drillDownSearch ?? []
    }
  };
}

export function toTotalRecordsNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function isSearchPostAllowedStatus(httpStatus: number): boolean {
  return httpStatus === 200;
}

function cookieMatchesHost(cookieDomain: string | undefined, hostName: string): boolean {
  if (!cookieDomain) {
    return false;
  }

  const normalizedDomain = cookieDomain.replace(/^\./, '').toLowerCase();
  const normalizedHost = hostName.toLowerCase();

  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

export async function getXsrfHeaders(apiRequest: APIRequestContext): Promise<Record<string, string>> {
  const environmentResponse = await apiRequest.get('/api/environment', { failOnStatusCode: false });
  let apiHostName: string | undefined;
  try {
    apiHostName = new URL(environmentResponse.url()).hostname;
  } catch {
    apiHostName = undefined;
  }

  const state = await apiRequest.storageState();
  const xsrfCookies = state.cookies.filter((cookie) => cookie.name === 'XSRF-TOKEN');
  if (xsrfCookies.length === 0) {
    return {};
  }

  const xsrfToken = (
    apiHostName
      ? xsrfCookies.find((cookie) => cookieMatchesHost(cookie.domain, apiHostName))?.value
      : undefined
  ) ?? xsrfCookies[xsrfCookies.length - 1]?.value;

  if (!xsrfToken) {
    return {};
  }

  return { 'x-xsrf-token': xsrfToken };
}
