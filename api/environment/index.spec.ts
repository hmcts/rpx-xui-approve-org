import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';

describe('environment/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockLogger: any;
  let uiConfigStub: any;

  beforeEach(() => {
    mockRequest = {
      session: {},
      csrfToken: sinon.stub().returns('test-csrf-token')
    };
    
    mockResponse = {
      cookie: sinon.stub(),
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
      end: sinon.stub()
    };

    mockLogger = createMockLogger();
    uiConfigStub = sinon.stub().returns({ config: 'test' });

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);
    sinon.stub(require('../configuration/ui'), 'uiConfig').callsFake(uiConfigStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('environmentRoute', () => {
    let router: any;

    beforeEach(() => {
      // Import the router after mocking dependencies
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should handle new session and set CSRF token', (done) => {
      mockRequest.session = { id: 'test-session-id' };
      mockRequest.session.save = sinon.stub().callsArgWith(0);

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      // Give async operation time to complete
      setTimeout(() => {
        expect(mockRequest.session.env).to.be.true;
        expect(mockRequest.session.save).to.have.been.calledOnce;
        
        expect(mockRequest.csrfToken).to.have.been.calledOnce;
        expect(mockResponse.cookie).to.have.been.calledOnce;
        expect(mockResponse.cookie).to.have.been.calledWith('XSRF-TOKEN', 'test-csrf-token');
        
        expect(mockResponse.status).to.have.been.calledOnce;
        expect(mockResponse.status).to.have.been.calledWith(200);
        expect(mockResponse.send).to.have.been.calledOnce;
        expect(mockResponse.send).to.have.been.calledWith({ config: 'test' });
        expect(mockResponse.end).to.have.been.calledOnce;
        
        expect(mockLogger.info).to.have.been.calledTwice;
        expect(mockLogger.info).to.have.been.calledWith('new session saved! ', 'test-session-id');
        expect(mockLogger.info).to.have.been.calledWith('token for new session: ', 'test-csrf-token');
        
        expect(uiConfigStub).to.have.been.calledOnce;
        
        done();
      }, 10);
    });

    it('should handle existing session without CSRF setup', () => {
      mockRequest.session = { 
        id: 'existing-session-id',
        env: true,
        save: sinon.stub()
      };

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      expect(mockLogger.info).to.have.been.calledOnce;
      expect(mockLogger.info).to.have.been.calledWith('existing session ', 'existing-session-id');
      
      expect(mockRequest.session.save).to.not.have.been.called;
      
      expect(mockRequest.csrfToken).to.not.have.been.called;
      expect(mockResponse.cookie).to.not.have.been.called;
      
      expect(mockResponse.status).to.have.been.calledOnce;
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith({ config: 'test' });
      
      expect(uiConfigStub).to.have.been.calledOnce;
    });

    it('should call uiConfig function exactly once', () => {
      mockRequest.session = { env: true };

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      expect(uiConfigStub).to.have.been.calledOnce;
      expect(uiConfigStub).to.have.been.calledWith();
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

    it('should have exactly one GET route configured for /config', () => {
      const module = require('./index');
      const router = module.router;
      
      expect(router.stack).to.have.length(1);
      
      const routeLayer = router.stack[0];
      expect(routeLayer.route).to.exist;
      expect(routeLayer.route.path).to.equal('/config');
      expect(routeLayer.route.methods.get).to.be.true;
      expect(routeLayer.route.methods.post).to.be.undefined;
      expect(routeLayer.route.methods.put).to.be.undefined;
      expect(routeLayer.route.methods.delete).to.be.undefined;
      
      expect(routeLayer.route.stack).to.have.length(1);
      expect(routeLayer.route.stack[0].handle).to.be.a('function');
    });
  });
});