import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';

describe('user/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockLogger: any;
  let configStub: any;
  let consoleLogStub: any;

  beforeEach(() => {
    mockRequest = {
      session: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    };
    
    mockResponse = {
      send: sinon.stub(),
      status: sinon.stub().returnsThis()
    };

    mockLogger = createMockLogger();
    configStub = sinon.stub().returns('1800'); // 30 minutes
    consoleLogStub = sinon.stub(console, 'log');

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);
    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('handleUserRoute', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should return user details with timeout configuration', () => {
      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      expect(configStub).to.have.been.calledWith('userTimeoutInSeconds');
      expect(consoleLogStub).to.have.been.calledWith('getConfigValue(USER_TIMEOUT_IN_SECONDS)', '1800');
      
      const sentData = JSON.parse(mockResponse.send.getCall(0).args[0]);
      expect(sentData).to.deep.include({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        idleTime: 1800000, // 1800 * 1000
        timeout: 600
      });
    });

    it('should handle missing user session', () => {
      mockRequest.session = {};

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      const sentData = JSON.parse(mockResponse.send.getCall(0).args[0]);
      expect(sentData).to.deep.include({
        idleTime: 1800000,
        timeout: 600
      });
    });

    it('should handle JSON stringify error', () => {
      // Create a circular reference to cause JSON.stringify to fail
      mockRequest.session.user.circular = mockRequest.session.user;

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      expect(mockLogger.info).to.have.been.called;
      expect(mockResponse.status).to.have.been.calledWith(500);
      
      const errorResponse = JSON.parse(mockResponse.send.getCall(0).args[0]);
      expect(errorResponse).to.have.property('apiError');
      expect(errorResponse).to.have.property('message', '');
    });

    it('should handle different timeout values', () => {
      configStub.returns('3600'); // 1 hour

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      const sentData = JSON.parse(mockResponse.send.getCall(0).args[0]);
      expect(sentData.idleTime).to.equal(3600000); // 3600 * 1000
    });

    it('should log the user payload', () => {
      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      expect(consoleLogStub).to.have.been.calledTwice;
      expect(consoleLogStub.secondCall.args[0]).to.include('test-user-id');
    });
  });

  describe('module exports', () => {
    it('should export router', () => {
      const module = require('./index');
      expect(module.router).to.exist;
      expect(module.default).to.exist;
    });

    it('should have GET route configured for /details', () => {
      const module = require('./index');
      const router = module.router;
      
      expect(router).to.be.a('function');
      expect(router.stack).to.be.an('array');
      expect(router.stack).to.have.length(1);
    });
  });
});