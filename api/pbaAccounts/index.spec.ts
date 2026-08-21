import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockEnhancedRequest, createMockResponse } from '../test/shared/authMocks';

describe('pbaAccounts/index', () => {
  let configStub: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    configStub = sinon.stub();
    configStub.withArgs('services.feeAndPayApi').returns('http://fee-pay-api.example.com');

    mockRequest = createMockEnhancedRequest();
    mockResponse = createMockResponse();

    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('route handler', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should make account request for single account name', async () => {
      mockRequest.query = { accountNames: 'TEST123' };
      mockRequest.http.get.resolves({ data: { account_name: 'TEST123', balance: 1000 } });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockRequest.http.get).to.have.been.calledWith('http://fee-pay-api.example.com/accounts/TEST123');
      expect(mockResponse.send).to.have.been.calledWith([{ account_name: 'TEST123', balance: 1000 }]);
    });

    it('should handle multiple account names with different formats', async () => {
      mockRequest.query = { accountNames: 'PBA0012345,TEST-123_test@example,123456' };
      mockRequest.http.get.onCall(0).resolves({ data: { account_name: 'PBA0012345' } });
      mockRequest.http.get.onCall(1).resolves({ data: { account_name: 'TEST-123_test@example' } });
      mockRequest.http.get.onCall(2).resolves({ data: { account_name: '123456' } });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockRequest.http.get).to.have.been.calledWith('http://fee-pay-api.example.com/accounts/PBA0012345');
      expect(mockRequest.http.get).to.have.been.calledWith('http://fee-pay-api.example.com/accounts/TEST-123_test@example');
      expect(mockRequest.http.get).to.have.been.calledWith('http://fee-pay-api.example.com/accounts/123456');
    });

    it('should handle account not found responses', async () => {
      mockRequest.query = { accountNames: 'NONEXISTENT' };
      mockRequest.http.get.resolves({ data: 'Account not found' });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockResponse.send).to.have.been.calledWith([{ account_name: 'not found' }]);
    });
  });

  describe('module exports', () => {
    it('should export router', () => {
      const module = require('./index');
      expect(module.router).to.exist;
      expect(module.default).to.exist;
    });

    it('should have GET route configured', () => {
      const module = require('./index');
      const router = module.router;

      expect(router).to.be.a('function');
      expect(router.stack).to.be.an('array');
    });
  });
});
