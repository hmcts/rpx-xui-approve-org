import { test, expect, type Page, type Request, type Route } from '@playwright/test';
import { setupSetPbaStatusApiMock } from '../integration/mocks';
import { buildPendingPbaDecisionState, mixedPbaDecisionPayload } from '../integration/test-data/pending-pba-decisions.data';

for (const scenario of [
  { name: 'removes the submitted organisation after success', status: 200, orgId: mixedPbaDecisionPayload.orgId, remaining: 0 },
  { name: 'preserves pending requests after rejection', status: 400, orgId: mixedPbaDecisionPayload.orgId, remaining: 1 },
  { name: 'preserves other organisations after success', status: 200, orgId: 'OTHER-ORG', remaining: 1 }
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
    expect(state.pendingPbaOrganisations).toHaveLength(scenario.remaining);
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
  expect(state.pendingPbaOrganisations).toHaveLength(1);
});
