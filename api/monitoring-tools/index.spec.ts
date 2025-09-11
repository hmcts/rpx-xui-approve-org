import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';

describe('monitoring-tools/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockLogger: any;
  let configStub: any;

  beforeEach(() => {
    mockRequest = {};

    mockResponse = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    };

    mockLogger = createMockLogger();
    configStub = sinon.stub().returns('InstrumentationKey=test-key;IngestionEndpoint=https://test.com/');

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);
    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('handleConnectionStringRoute', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should return AppInsights connection string successfully', async () => {
      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(configStub).to.have.been.calledWith('secrets.rpx.appinsights-connection-string-ao');
      expect(mockLogger.info).to.have.been.calledWith('environmentConfig.appInsightsConnectionString is InstrumentationKey=test-key;IngestionEndpoint=https://test.com/');
      expect(mockResponse.send).to.have.been.calledWith({
        connectionString: 'InstrumentationKey=test-key;IngestionEndpoint=https://test.com/'
      });
    });

    it('should handle undefined connection string', async () => {
      configStub.returns(undefined);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockLogger.info).to.have.been.calledWith('environmentConfig.appInsightsConnectionString is undefined');
      expect(mockResponse.send).to.have.been.calledWith({
        connectionString: undefined
      });
    });

    it('should handle null connection string', async () => {
      configStub.returns(null);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockResponse.send).to.have.been.calledWith({
        connectionString: null
      });
    });

    it('should handle configuration errors gracefully', async () => {
      const error = new Error('Configuration error') as any;
      error.statusCode = 404;
      configStub.throws(error);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      const expectedError = JSON.stringify({
        apiError: error,
        apiStatusCode: 404,
        message: 'List of users route error'
      });

      expect(mockResponse.send).to.have.been.calledWith(expectedError);
      expect(mockResponse.status).to.have.been.calledWith(500);
    });

    it('should handle error without statusCode', async () => {
      const error = new Error('Generic error');
      configStub.throws(error);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      const callArgs = mockResponse.send.getCall(0).args[0];
      const errorResponse = JSON.parse(callArgs);

      expect(errorResponse).to.have.property('apiError');
      expect(errorResponse.apiError).to.be.an('object');
      expect(errorResponse.apiStatusCode).to.be.undefined;
      expect(errorResponse).to.have.property('message', 'List of users route error');
    });
  });

  describe('module exports', () => {
    it('should export router', () => {
      const module = require('./index');
      expect(module.router).to.exist;
      expect(module.default).to.exist;
    });

    it('should have GET route configured for /', () => {
      const module = require('./index');
      const router = module.router;

      expect(router).to.be.a('function');
      expect(router.stack).to.be.an('array');
      expect(router.stack).to.have.length(1);
    });
  });
});
