import { test, expect } from './helpers/api.fixtures';
import { findUserByEmail, isOrganisationUser } from './helpers/all-user-list-without-roles.helpers';
import { cleanupProvisionedOrganisation, provisionActiveOrganisation } from './helpers/organisations-write.helpers';
import { resolveHeader, searchEnvelopeShapeErrors } from './helpers/json-contracts';
import {
  createOrganisationSearchPayload,
  getXsrfHeaders,
  isSearchPostAllowedStatus,
  toTotalRecordsNumber
} from './helpers/search.helpers';

const ORGANISATION_SEARCH_PAGE_SIZE = 10;

const organisationSearchScenarios = [
  {
    name: 'pending organisation search with search term',
    status: 'PENDING,REVIEW' as const,
    payload: createOrganisationSearchPayload({
      view: 'NEW',
      searchFilter: 'test',
      pageNumber: 1,
      pageSize: ORGANISATION_SEARCH_PAGE_SIZE
    })
  }
];

test.describe('Playwright API positive: organisations', { tag: ['@organisations', '@positive'] }, () => {
  test(
    'POST /api/organisations search: active organisation search with empty search term returns a bounded envelope',
    { tag: '@refdata-search' },
    async ({ apiRequest }) => {
      const xsrfHeaders = await getXsrfHeaders(apiRequest);
      const response = await apiRequest.post('/api/organisations?status=ACTIVE', {
        failOnStatusCode: false,
        headers: xsrfHeaders,
        data: createOrganisationSearchPayload({
          view: 'ACTIVE',
          searchFilter: '',
          pageNumber: 1,
          pageSize: ORGANISATION_SEARCH_PAGE_SIZE
        })
      });

      expect(
        response.status(),
        `Expected 200 from bounded active empty-search POST. Received status=${response.status()}`
      ).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type for bounded active empty-search POST. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json() as { organisations: Array<Record<string, unknown>>; total_records: unknown };
      expect(searchEnvelopeShapeErrors(payload)).toEqual([]);
      expect(payload.organisations.length, 'Expected the active empty-search response to contain no more than the requested page size').toBeLessThanOrEqual(
        ORGANISATION_SEARCH_PAGE_SIZE
      );
      expect(
        toTotalRecordsNumber(payload.total_records),
        'Expected total_records to describe at least the returned active-organisation page'
      ).toBeGreaterThanOrEqual(payload.organisations.length);

      const firstOrganisation = payload.organisations[0];
      if (firstOrganisation && typeof firstOrganisation === 'object') {
        expect(firstOrganisation).toHaveProperty('organisationIdentifier');
      }
    }
  );

  test('GET /api/organisations?usersOrgId=<id>&page=0 returns current organisation users', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'OrgUsers',
        lastName: 'List'
      });
      organisationId = provisioned.organisationId;

      const response = await apiRequest.get('/api/organisations', {
        params: {
          usersOrgId: provisioned.organisationId,
          page: 0
        },
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 from GET /api/organisations?usersOrgId=${provisioned.organisationId}&page=0. Received status=${httpStatus}`
      ).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type for GET /api/organisations users list. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json();
      expect(
        typeof payload,
        `Expected object payload from GET /api/organisations users list. Received payloadType=${typeof payload}`
      ).toBe('object');
      expect(
        Array.isArray(payload.users),
        `Expected payload.users to be an array for usersOrgId=${provisioned.organisationId}. payload=${JSON.stringify(payload)}`
      ).toBe(true);
      expect(
        payload.users.length,
        `Expected at least one current user for usersOrgId=${provisioned.organisationId}. Received usersLength=${payload.users.length}`
      ).toBeGreaterThan(0);

      const matchedUser = findUserByEmail(payload.users, provisioned.workEmailAddress);
      expect(
        matchedUser,
        `Expected users list for usersOrgId=${provisioned.organisationId} to include email=${provisioned.workEmailAddress}.`
      ).toBeDefined();
      expect(
        matchedUser?.firstName,
        `Expected matched user firstName=${provisioned.firstName}. Received firstName=${JSON.stringify(matchedUser?.firstName)}`
      ).toBe(provisioned.firstName);
      expect(
        matchedUser?.lastName,
        `Expected matched user lastName=${provisioned.lastName}. Received lastName=${JSON.stringify(matchedUser?.lastName)}`
      ).toBe(provisioned.lastName);

      const firstUser = payload.users[0];
      expect(
        isOrganisationUser(firstUser),
        `Expected first user to be an object. firstUser=${JSON.stringify(firstUser)}`
      ).toBe(true);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  for (const scenario of organisationSearchScenarios) {
    test(`POST /api/organisations search: ${scenario.name}`, { tag: '@refdata-search' }, async ({ apiRequest }) => {
      const xsrfHeaders = await getXsrfHeaders(apiRequest);
      const response = await apiRequest.post(`/api/organisations?status=${encodeURIComponent(scenario.status)}`, {
        failOnStatusCode: false,
        headers: xsrfHeaders,
        data: scenario.payload
      });

      const httpStatus = response.status();
      expect(
        isSearchPostAllowedStatus(httpStatus),
        `Expected POST /api/organisations?status=${scenario.status} to return 200. Received status=${httpStatus}`
      ).toBe(true);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type for POST /api/organisations search. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json();
      const shapeErrors = searchEnvelopeShapeErrors(payload);
      expect(
        shapeErrors,
        `Expected organisation search envelope shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
      ).toEqual([]);

      const responsePayload = payload as { organisations: unknown[]; total_records: unknown };
      const totalRecords = toTotalRecordsNumber(responsePayload.total_records);
      expect(totalRecords, 'Expected total_records to be coercible to a finite number').not.toBeNull();
      expect(totalRecords as number).toBeGreaterThanOrEqual(responsePayload.organisations.length);
      expect(responsePayload.organisations.length).toBeLessThanOrEqual(ORGANISATION_SEARCH_PAGE_SIZE);

      const firstOrganisation = responsePayload.organisations[0] as Record<string, unknown> | undefined;
      if (firstOrganisation && typeof firstOrganisation === 'object') {
        expect(firstOrganisation).toHaveProperty('organisationIdentifier');
      }
    });
  }

  test('POST /api/organisations search finds a provisioned active organisation by a non-empty term', {
    tag: ['@organisation-provider-search', '@refdata-search']
  }, async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'ActiveSearch',
        lastName: 'Bounded'
      });
      organisationId = provisioned.organisationId;
      const response = await apiRequest.post('/api/organisations?status=ACTIVE', {
        failOnStatusCode: false,
        headers: await getXsrfHeaders(apiRequest),
        data: createOrganisationSearchPayload({
          view: 'ACTIVE',
          searchFilter: provisioned.organisationSeed,
          pageNumber: 1,
          pageSize: ORGANISATION_SEARCH_PAGE_SIZE
        })
      });

      expect(
        response.status(),
        `Expected bounded active search to return 200 for seed=${provisioned.organisationSeed}. Received status=${response.status()}`
      ).toBe(200);

      const payload = await response.json() as { organisations: Array<Record<string, unknown>>; total_records: unknown };
      expect(searchEnvelopeShapeErrors(payload)).toEqual([]);
      expect(payload.organisations).toHaveLength(1);
      expect(payload.organisations[0]).toEqual(expect.objectContaining({ organisationIdentifier: provisioned.organisationId }));
      expect(toTotalRecordsNumber(payload.total_records)).toBe(1);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});
