import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { EventEmitter } from 'events';
import AxiosMockAdapter = require('axios-mock-adapter');
import { createAuthMocks } from '../test/shared/authMocks';

describe('ACTIVE paging through the authenticated HTTP adapter', () => {
  let transport: AxiosMockAdapter;
  let handler: any;
  let req: any;
  let res: any;
  const modulePaths = ['./index', '../lib/http', '../lib/interceptors'].map((path) => require.resolve(path));
  let cachedModules: NodeModule[];
  const logger = { info: sinon.stub(), error: sinon.stub(), trackRequest: sinon.stub() };
  const endpoint = 'https://rd-professional-api.example.com/refdata/internal/v1/organisations/search';
  const organisations = [{
    name: 'Smith Legal', organisationIdentifier: 'ORG123', status: 'ACTIVE', sraId: '12345',
    companyNumber: 'AB1234', companyUrl: 'https://smith.example', sraRegulated: true,
    superUser: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    contactInformation: [{ addressLine1: '1 Street', postCode: 'SW1A 1AA',
      dxAddress: [{ dxNumber: 'DX123', dxExchange: 'London' }] }],
    paymentAccount: ['PBA1234567'], pendingPaymentAccount: ['PBA7654321']
  }];

  beforeEach(() => {
    // Other suites reload configuration and logging, so bind this adapter to the current stubs.
    cachedModules = modulePaths.map((path) => require.cache[path]);
    modulePaths.forEach((path) => delete require.cache[path]);
    sinon.stub(require('../configuration'), 'getConfigValue').returns('https://rd-professional-api.example.com');
    Object.values(logger).forEach((method) => method.resetHistory());
    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(logger);
    const mocks = createAuthMocks();
    req = mocks.req;
    res = Object.assign(new EventEmitter(), mocks.res);
    req.query = { status: 'ACTIVE' };
    req.body = { searchRequest: { search_filter: '', pagination_parameters: { page_number: 2, page_size: 10 } } };
    req.http = require('../lib/http').http(req);
    transport = new AxiosMockAdapter(req.http);
    handler = require('./index').default.stack.find((layer: any) =>
      layer.route?.path === '/' && layer.route.methods.post
    ).route.stack[0].handle;
  });

  afterEach(() => {
    transport?.restore();
    sinon.restore();
    modulePaths.forEach((path, index) => {
      if (cachedModules[index]) {
        require.cache[path] = cachedModules[index];
      } else {
        delete require.cache[path];
      }
    });
  });

  for (const term of ['', undefined, 'smith SW1A 1AA', ' smith sw1a1aa ', 'Smith Legal', 'SW1A 1AA',
    '12345', 'Jane Smith', 'jane@example.com', 'PBA1234567', 'DX123', 'London', 'a', 'ab', '   ', '%_\\',
    '001fcFuzqHZCE6UptKv3 EsqkclX1AU9OTRJxsGSA']) {
    it(`forwards raw input ${JSON.stringify(term)} once and preserves the nested v1 DTO`, async () => {
      req.body.searchRequest.search_filter = term;
      transport.onPost(endpoint).reply((config) => {
        expect(JSON.parse(config.data)).to.deep.equal({ searchTerm: term ?? '', statuses: ['ACTIVE'], page: 2, size: 10 });
        expect(config.headers.Authorization).to.equal('Bearer test-token');
        expect(config.headers.ServiceAuthorization).to.equal('Bearer s2s-token');
        expect(config.timeout).to.equal(27_000);
        expect(config.signal).to.exist;
        return [200, { organisations, moreAvailable: true }, { total_records: '21' }];
      });
      await handler(req, res);
      expect(transport.history.post).to.have.length(1);
      expect(transport.history.get).to.have.length(0);
      expect(res.send).to.have.been.calledOnceWithExactly({ organisations, total_records: 21 });
      expect(res.listenerCount('close')).to.equal(0);
      expect(req.body.searchRequest.search_filter).to.equal(term);
    });
  }

  for (const count of ['0', '11', String(Number.MAX_SAFE_INTEGER)]) {
    it(`returns an empty zero/past-end page with exact numeric count ${count}`, async () => {
      transport.onPost(endpoint).reply(200, { organisations: [] }, { total_records: count as any });
      await handler(req, res);
      expect(res.send).to.have.been.calledWith({ organisations: [], total_records: Number(count) });
    });
  }

  for (const count of [undefined, null, '', ' ', '-1', -1, '1.5', 1.5, '1e2', 'NaN', 'Infinity',
    '9007199254740992', true, ['1'], ['1', '1'], '1, 1']) {
    it(`fails closed for invalid total_records ${JSON.stringify(count)}`, async () => {
      transport.onPost(endpoint).reply(200, { organisations: [] }, { total_records: count as any });
      await handler(req, res);
      expect(res.status).to.have.been.calledWith(500);
      expect(res.send).to.have.been.calledOnceWithExactly({ apiError: 'Organisation service request failed',
        apiStatusCode: undefined, message: 'handlePostOrganisationsRoute error' });
      expect(transport.history.get).to.have.length(0);
    });
  }

  for (const count of [0, 11, Number.MAX_SAFE_INTEGER]) {
    it(`rejects a numeric header ${count} when supplied directly by the HTTP adapter`, async () => {
      sinon.stub(req.http, 'post').resolves({ data: { organisations: [] }, headers: { total_records: count } });
      await handler(req, res);
      expect(res.status).to.have.been.calledWith(500);
      expect(res.send).to.have.been.calledOnceWithExactly({ apiError: 'Organisation service request failed',
        apiStatusCode: undefined, message: 'handlePostOrganisationsRoute error' });
    });
  }

  for (const data of [{}, { organisations: null }, { organisations: {} }]) {
    it(`rejects a malformed provider list ${JSON.stringify(data)}`, async () => {
      transport.onPost(endpoint).reply(200, data, { total_records: '0' });
      await handler(req, res);
      expect(res.status).to.have.been.calledWith(500);
    });
  }

  for (const row of [null, false, 123, 'org', [], {}, { organisationIdentifier: null },
    { organisationIdentifier: 123 }, { organisationIdentifier: '' }, { organisationIdentifier: '  ' }]) {
    it(`rejects a non-record row or missing View identifier ${JSON.stringify(row)}`, async () => {
      transport.onPost(endpoint).reply(200, { organisations: [row] }, { total_records: '1' });
      await handler(req, res);
      expect(res.status).to.have.been.calledWith(500);
    });
  }

  it('preserves the response safety check', async () => {
    transport.onPost(endpoint).reply(200, { organisations: [{ organisationIdentifier: 'ORG123', name: '<script>alert(1)</script>' }] }, { total_records: '1' });
    await handler(req, res);
    expect(res.status).to.have.been.calledWith(400);
    expect(res.send).to.have.been.calledWith('Invalid organisation list received');
  });

  for (const status of [404, 503]) {
    it(`preserves historical error mapping for upstream ${status}, without a legacy download`, async () => {
      transport.onPost(endpoint).reply(status, { message: 'Upstream failure' });
      await handler(req, res);
      expect(res.status).to.have.been.calledWith(500);
      expect(res.send).to.have.been.calledOnceWithExactly({ apiError: 'Organisation service request failed',
        apiStatusCode: status, message: 'handlePostOrganisationsRoute error' });
      expect(transport.history.get).to.have.length(0);
      expect(transport.history.post).to.have.length(1);
      expect(res.listenerCount('close')).to.equal(0);
    });
  }

  it('keeps upstream response diagnostics out of logs and the browser', async () => {
    const sentinel = 'SENSITIVE_SEARCH_RESPONSE_SENTINEL';
    transport.onPost(endpoint).reply(503, { message: sentinel, details: { profile: sentinel } });
    await handler(req, res);
    expect(res.status).to.have.been.calledWith(500);
    expect(res.send).to.have.been.calledWith(sinon.match({ apiError: 'Organisation service request failed', apiStatusCode: 503 }));
    expect(logger.trackRequest).to.have.been.calledWith(sinon.match({ success: false, resultCode: 503 }));
    const diagnostics = Object.values(logger).map((method) => method.getCalls().map((call) => call.args));
    expect(JSON.stringify(diagnostics)).not.to.include(sentinel);
    expect(JSON.stringify(res.send.getCalls().map((call) => call.args))).not.to.include(sentinel);
  });

  it('answers a transport timeout instead of falling back to a download', async () => {
    transport.onPost(endpoint).timeout();
    await handler(req, res);
    expect(res.status).to.have.been.calledWith(500);
    expect(res.send).to.have.been.calledWith(sinon.match({ apiError: 'Organisation service request failed' }));
    expect(transport.history.get).to.have.length(0);
  });

  it('aborts the search and sends a separate authenticated cancellation when the browser disconnects', async () => {
    let signal: any;
    let searchId: string;
    transport.onPost(new RegExp(`${endpoint}/[^/]+/cancel$`)).reply(204);
    transport.onPost(endpoint).reply((config) => {
      signal = config.signal;
      searchId = config.headers['X-Organisation-Search-Id'];
      res.destroyed = true;
      res.emit('close');
      return [200, { organisations }, { total_records: '1' }];
    });
    await handler(req, res);
    expect(searchId).to.match(/^[a-f\d-]{36}$/);
    expect(transport.history.post.map(({ url }) => url)).to.deep.equal([endpoint, `${endpoint}/${searchId}/cancel`]);
    const cancellation = transport.history.post[1];
    expect(cancellation.headers.Authorization).to.equal('Bearer test-token');
    expect(cancellation.headers.ServiceAuthorization).to.equal('Bearer s2s-token');
    expect(cancellation.signal).not.to.equal(signal);
    expect(cancellation.signal.aborted).to.equal(false);
    expect(signal.aborted).to.equal(true);
    expect(res.send).not.to.have.been.called;
    expect(res.status).not.to.have.been.called;
    expect(res.listenerCount('close')).to.equal(0);
  });

  it('aborts the whole upstream operation at 27 seconds', async () => {
    const clock = sinon.useFakeTimers();
    transport.onPost(endpoint).reply((config) => {
      clock.tick(26_999);
      expect(config.signal.aborted).to.equal(false);
      clock.tick(1);
      expect(config.signal.aborted).to.equal(true);
      return [200, { organisations }, { total_records: '1' }];
    });
    await handler(req, res);
    expect(res.status).to.have.been.calledWith(500);
    expect(clock.countTimers()).to.equal(0);
  });

  it('does not start upstream work for an already aborted browser request', async () => {
    req.aborted = true;
    await handler(req, res);
    expect(transport.history.post).to.have.length(0);
    expect(res.send).not.to.have.been.called;
    expect(res.status).not.to.have.been.called;
    expect(res.listenerCount('close')).to.equal(0);
  });

  it('does not start upstream work when the response socket already closed', async () => {
    res.destroyed = true;
    await handler(req, res);
    expect(transport.history.post).to.have.length(0);
    expect(res.listenerCount('close')).to.equal(0);
  });

  it('creates a trusted 25-second provider deadline instead of forwarding the browser header', async () => {
    const clock = sinon.useFakeTimers({ now: 1_800_000_000_000 });
    req.headers['X-Organisation-Search-Deadline'] = '1';
    req.headers['x-organisation-search-deadline'] = '9999999999999999';
    transport.onPost(endpoint).reply((config) => {
      const deadline = config.headers['X-Organisation-Search-Deadline'];
      expect(deadline).to.equal(String(Date.now() + 25_000));
      expect(Number.isSafeInteger(Number(deadline))).to.equal(true);
      return [200, { organisations }, { total_records: '1' }];
    });
    await handler(req, res);
    expect(res.send).to.have.been.calledWith({ organisations, total_records: 1 });
    expect(clock.countTimers()).to.equal(0);
  });

  it('keeps PENDING browse on its independent GET route', async () => {
    req.query.status = 'PENDING';
    transport.onGet('https://rd-professional-api.example.com/refdata/internal/v1/organisations?page=2&size=10&status=PENDING')
      .reply(200, { organisations: [] }, { total_records: '0' });
    await handler(req, res);
    expect(transport.history.post).to.have.length(0);
    expect(transport.history.get).to.have.length(1);
    expect(res.send).to.have.been.calledWith({ organisations: [], total_records: '0' });
  });
});
