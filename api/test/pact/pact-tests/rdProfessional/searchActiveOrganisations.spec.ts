import { expect } from 'chai';
import { EventEmitter } from 'events';
import * as sinon from 'sinon';
import { MatchersV2, PactV2 } from '@pact-foundation/pact';
import * as path from 'path';
import { createAuthMocks } from '../../../shared/authMocks';

const provider = new PactV2({ consumer: 'xui_approveorg', provider: 'referenceData_organisationalInternal',
  dir: path.resolve('api/test/pact/pacts'), spec: 2 });
const organisation = {
  organisationIdentifier: 'SYN0001', name: 'Smith Legal', status: 'ACTIVE',
  companyNumber: 'A1000', companyUrl: 'https://example.invalid', sraId: 'synthetic-sra', sraRegulated: true,
  paymentAccount: ['PBA0000001'], pendingPaymentAccount: ['PBA0000002'],
  contactInformation: [{ addressLine1: '1 Synthetic Street', postCode: 'SW1A 1AA',
    dxAddress: [{ dxNumber: 'DX1', dxExchange: 'Synthetic' }] }],
  dateReceived: '2026-01-01T00:00:00', organisationProfileIds: ['SOLICITOR_PROFILE', 'ORGANISATION_PROFILE'],
  superUser: { firstName: 'Ada', lastName: 'Smith', email: 'ada@example.invalid' }
};

describe('Active search Pact through the AO request-scoped adapter', () => {
  before(async () => {
    await provider.setup();
  });
  after(async () => {
    await provider.finalize();
  });
  afterEach(() => {
    sinon.restore();
  });
  const { superUser, ...withoutAdmin } = organisation;
  const cases = [
    { state: 'Active combined search has a current administrator', term: 'smith SW1A 1AA', page: 1,
      total: 1, organisations: [organisation] },
    { state: 'Active browse includes an organisation without an administrator', term: '', page: 1,
      total: 1, organisations: [withoutAdmin] },
    { state: 'Active search beyond the last page preserves its exact total', term: 'smith SW1A 1AA', page: 14,
      total: 123, organisations: [] },
    { state: 'Active search has no matches', term: 'absent', page: 1, total: 0, organisations: [] }
  ];
  for (const scenario of cases) {
    it(scenario.state, async () => {
      await provider.addInteraction({ state: scenario.state, uponReceiving: scenario.state,
        withRequest: { method: 'POST', path: '/refdata/internal/v1/organisations/search',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token',
            ServiceAuthorization: 'Bearer s2s-token',
            'X-Organisation-Search-Deadline': MatchersV2.term({ generate: '4102444800000', matcher: '^[0-9]{13}$' }) },
          body: { searchTerm: scenario.term, statuses: ['ACTIVE'], page: scenario.page, size: 10 } },
        willRespondWith: { status: 200, headers: { 'Content-Type': 'application/json',
          total_records: String(scenario.total) },
        body: { organisations: scenario.organisations, moreAvailable: false } } });
      sinon.stub(require('../../../../configuration'), 'getConfigValue').returns(provider.mockService.baseUrl);
      const { req, res: response } = createAuthMocks();
      const res = Object.assign(new EventEmitter(), response);
      req.query = { status: 'ACTIVE' };
      req.body = { searchRequest: { search_filter: scenario.term,
        pagination_parameters: { page_number: scenario.page, page_size: 10 } } };
      req.http = require('../../../../lib/http').http(req);
      const handler = require('../../../../organisation/index').default.stack.find((layer: any) =>
        layer.route?.path === '/' && layer.route.methods.post).route.stack[0].handle;
      await handler(req, res);
      expect(res.send.calledOnceWithExactly({ organisations: scenario.organisations,
        total_records: scenario.total })).to.equal(true);
      await provider.verify();
    });
  }
});
