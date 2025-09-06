import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';

describe('healthCheck/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockLogger: any;
  let healthEndpointsStub: any;
  let consoleLogStub: any;

  beforeEach(() => {
    mockRequest = {
      query: {},
      get: sinon.stub()
    };
    
    mockResponse = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    };

    mockLogger = createMockLogger();
    healthEndpointsStub = sinon.stub().returns({
      rdProfessionalApi: 'https://rd-professional-api.example.com/health'
    });
    consoleLogStub = sinon.stub(console, 'log');

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);
    sinon.stub(require('../configuration/health'), 'healthEndpoints').callsFake(healthEndpointsStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('healthCheckRoute', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should return healthy when no path specified', async () => {
      mockRequest.query = { path: '' };

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.not.have.been.called;
      expect(mockRequest.get).to.not.have.been.called;
      
      expect(mockLogger.info).to.have.been.calledOnce;
      expect(mockLogger.info).to.have.been.calledWith('response::', { healthState: true });
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
      expect(mockResponse.status).to.not.have.been.called;
    });

    it('should return healthy when path has no health endpoints', async () => {
      mockRequest.query = { path: '/unknown-path' };

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.not.have.been.called;
      expect(mockRequest.get).to.not.have.been.called;
      expect(consoleLogStub).to.not.have.been.called;
      
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
      expect(mockResponse.status).to.not.have.been.called;
    });

    it('should check health endpoints for known paths', async () => {
      mockRequest.query = { path: '/organisation' };
      mockRequest.get.resolves({ status: 200 });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.have.been.calledTwice;
      
      expect(consoleLogStub).to.have.been.calledTwice;
      expect(consoleLogStub.getCall(0)).to.have.been.calledWith('healthEndpoints');
      expect(consoleLogStub.getCall(1)).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      
      expect(mockRequest.get).to.have.been.calledOnce;
      expect(mockRequest.get).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
      expect(mockResponse.status).to.not.have.been.called;
    });

    it('should check health for users path', async () => {
      mockRequest.query = { path: '/users' };
      mockRequest.get.resolves({ status: 200 });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.have.been.calledTwice;
      expect(mockRequest.get).to.have.been.calledOnce;
      expect(mockRequest.get).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
    });

    it('should check health for users invite path', async () => {
      mockRequest.query = { path: '/users/invite-user' };
      mockRequest.get.resolves({ status: 200 });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.have.been.calledTwice;
      expect(mockRequest.get).to.have.been.calledOnce;
      expect(mockRequest.get).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
    });

    it('should check health for register check path', async () => {
      mockRequest.query = { path: '/register-org/register/check' };
      mockRequest.get.resolves({ status: 200 });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.have.been.calledTwice;
      expect(mockRequest.get).to.have.been.calledOnce;
      expect(mockRequest.get).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
    });

    it('should return unhealthy when health check fails', async () => {
      mockRequest.query = { path: '/organisation' };
      const healthError = new Error('Health check failed');
      mockRequest.get.rejects(healthError);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.have.been.calledTwice;
      expect(mockRequest.get).to.have.been.calledOnce;
      expect(mockRequest.get).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      
      expect(consoleLogStub).to.have.been.called;
      expect(mockLogger.info).to.have.been.calledOnce;
      expect(mockLogger.info).to.have.been.calledWith('response::', { healthState: false });
      
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: false });
      expect(mockResponse.status).to.not.have.been.called;
    });

    it('should handle network timeouts gracefully', async () => {
      mockRequest.query = { path: '/organisation' };
      const timeoutError = new Error('ETIMEDOUT') as any;
      timeoutError.name = 'TimeoutError';
      timeoutError.code = 'ETIMEDOUT';
      mockRequest.get.rejects(timeoutError);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.have.been.calledTwice;
      expect(mockRequest.get).to.have.been.calledOnce;
      
      expect(consoleLogStub).to.have.been.called;
      
      expect(mockLogger.info).to.have.been.calledOnce;
      expect(mockLogger.info).to.have.been.calledWith('response::', { healthState: false });
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: false });
    });

    it('should handle unexpected errors in try-catch block', async () => {
      mockRequest.query = { path: '/organisation' };
      const error = new Error('Unexpected error') as any;
      error.status = 500;
      
      // Force an error in the try block by making healthEndpoints throw
      healthEndpointsStub.throws(error);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(consoleLogStub).to.have.been.calledWith(error);
      expect(mockLogger.info).to.have.been.calledWith('error', { healthState: false });
      expect(mockResponse.status).to.have.been.calledWith(500);
      expect(mockResponse.send).to.have.been.calledWith({ healthState: false });
    });

    it('should handle undefined path query', async () => {
      mockRequest.query = {};

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
    });

    it('should handle multiple health endpoints correctly', async () => {
      healthEndpointsStub.returns({
        rdProfessionalApi: 'https://rd-professional-api.example.com/health',
        idamApi: 'https://idam-api.example.com/health',
        ccdDataApi: 'https://ccd-data-api.example.com/health'
      });

      // Update health check dictionary to include multiple endpoints
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;

      mockRequest.query = { path: '/organisation' };
      mockRequest.get.resolves({ status: 200 });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(healthEndpointsStub).to.have.been.calledTwice;
      
      expect(mockRequest.get).to.have.been.calledOnce;
      expect(mockRequest.get).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      
      expect(consoleLogStub).to.have.been.calledWith('healthEndpoints');
      expect(consoleLogStub).to.have.been.calledWith('https://rd-professional-api.example.com/health');
      
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ healthState: true });
    });
  });

  describe('module exports', () => {
    it('should export router as Express router', () => {
      const module = require('./index');
      
      expect(module.router).to.be.a('function');
      expect(module.router.stack).to.be.an('array');
      expect(module.default).to.be.a('function');
      expect(module.router).to.equal(module.default);
      expect(module.router.name).to.equal('router');
    });

    it('should have exactly one GET route configured for /', () => {
      const module = require('./index');
      const router = module.router;
      
      expect(router.stack).to.have.length(1);
      
      const routeLayer = router.stack[0];
      expect(routeLayer.route).to.exist;
      expect(routeLayer.route.path).to.equal('/');
      expect(routeLayer.route.methods.get).to.be.true;
      expect(routeLayer.route.methods.post).to.be.undefined;
      expect(routeLayer.route.methods.put).to.be.undefined;
      expect(routeLayer.route.methods.delete).to.be.undefined;
      
      expect(routeLayer.route.stack).to.have.length(1);
      expect(routeLayer.route.stack[0].handle).to.be.a('function');
    });
  });
});