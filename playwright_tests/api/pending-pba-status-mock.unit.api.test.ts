import { test, expect, type Page, type Request, type Response, type Route } from '@playwright/test';
import { setupSetPbaStatusApiMock, waitForSetPbaStatusResponseWithHttpStatus } from '../integration/mocks';
import {
  buildPendingPbaDecisionState, mixedPbaDecisionPayload, PBA_DECISION_ORG_ID, UNRELATED_PENDING_ORG_ID
} from '../integration/test-data/pending-pba-decisions.data';

for (const scenario of [
  {
    name: 'removes only the submitted organisation after success', status: 200, orgId: PBA_DECISION_ORG_ID,
    remainingIds: [UNRELATED_PENDING_ORG_ID]
  },
  {
    name: 'preserves pending requests after rejection', status: 400, orgId: PBA_DECISION_ORG_ID,
    remainingIds: [PBA_DECISION_ORG_ID, UNRELATED_PENDING_ORG_ID]
  },
  {
    name: 'preserves other organisations after success', status: 200, orgId: 'OTHER-ORG',
    remainingIds: [PBA_DECISION_ORG_ID, UNRELATED_PENDING_ORG_ID]
  }
]) {
  test(`pending PBA status mock ${scenario.name}`, async () => {
    let handler!: (route: Route, request: Request) => Promise<void>;
    const page = {
      route: async (_url: string, callback: typeof handler) => {
        handler = callback;
      }
    } as unknown as Page;
    const state = buildPendingPbaDecisionState();
    const control = await setupSetPbaStatusApiMock(page, {
      status: scenario.status,
      pendingPbaOrganisations: state.pendingPbaOrganisations
    });
    const payload = { ...mixedPbaDecisionPayload, orgId: scenario.orgId };
    let fulfilledStatus: number | undefined;
    const route = {
      fulfill: async (response: { status: number }) => {
        fulfilledStatus = response.status;
      }
    } as unknown as Route;
    const request = {
      method: () => 'PUT',
      postDataJSON: () => payload
    } as unknown as Request;

    await handler(route, request);

    expect(fulfilledStatus).toBe(scenario.status);
    expect(control.getLastPayload()).toEqual(payload);
    expect(state.pendingPbaOrganisations.map((organisation) => organisation.organisationIdentifier)).toEqual(scenario.remainingIds);
  });
}

test('pending PBA status mock falls through for other methods without changing pending state', async () => {
  let handler!: (route: Route, request: Request) => Promise<void>;
  const page = {
    route: async (_url: string, callback: typeof handler) => {
      handler = callback;
    }
  } as unknown as Page;
  const state = buildPendingPbaDecisionState();
  const control = await setupSetPbaStatusApiMock(page, { pendingPbaOrganisations: state.pendingPbaOrganisations });
  let fellThrough = false;
  const route = { fallback: async () => {
    fellThrough = true;
  } } as unknown as Route;
  const request = { method: () => 'GET' } as unknown as Request;

  await handler(route, request);

  expect(fellThrough).toBe(true);
  expect(control.getLastPayload()).toBeUndefined();
  expect(state.pendingPbaOrganisations.map((organisation) => organisation.organisationIdentifier)).toEqual([
    PBA_DECISION_ORG_ID, UNRELATED_PENDING_ORG_ID
  ]);
});

for (const scenario of [
  { name: 'matches the requested server error', method: 'PUT', path: '/api/pba/status', status: 500, matches: true },
  { name: 'ignores other statuses', method: 'PUT', path: '/api/pba/status', status: 200, matches: false },
  { name: 'ignores pending-list responses', method: 'PUT', path: '/api/pba/status/pending', status: 500, matches: false },
  { name: 'ignores other methods', method: 'GET', path: '/api/pba/status', status: 500, matches: false }
]) {
  test(`pending PBA response waiter ${scenario.name}`, async () => {
    const response = {
      request: () => ({ method: () => scenario.method, url: () => `http://localhost${scenario.path}` }),
      status: () => scenario.status
    } as unknown as Response;
    let matches: boolean | undefined;
    const page = {
      waitForResponse: async (predicate: (candidate: Response) => boolean) => {
        matches = predicate(response);
        return response;
      }
    } as unknown as Page;

    await waitForSetPbaStatusResponseWithHttpStatus(page, 500);

    expect(matches).toBe(scenario.matches);
  });
}
