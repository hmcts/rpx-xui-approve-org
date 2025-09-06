import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';
import { createMockEnhancedRequest, createMockResponse } from '../test/shared/authMocks';

describe('allUserListWithoutRoles/index', () => {
  let configStub: any;
  let mockLogger: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    configStub = sinon.stub();
    configStub.withArgs('services.rdProfessionalApi').returns('http://rd-api.example.com');
    mockLogger = createMockLogger();
    mockRequest = createMockEnhancedRequest();
    mockResponse = createMockResponse();
    
    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);
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

    it('should make request to base organisation URL when no usersOrgId provided', async () => {
      mockRequest.query = {};
      mockRequest.http.get.resolves({ data: { organisations: [] } });
      
      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);
      
      expect(mockRequest.http.get).to.have.been.calledWith('http://rd-api.example.com/refdata/internal/v1/organisations');
      expect(mockResponse.send).to.have.been.calledWith({ organisations: [] });
    });

    it('should make request with organisation ID when usersOrgId provided', async () => {
      mockRequest.query = { usersOrgId: 'test-org-123' };
      mockRequest.http.get.resolves({ data: { users: [] } });
      
      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);
      
      expect(mockRequest.http.get).to.have.been.calledWith('http://rd-api.example.com/refdata/internal/v1/organisations/test-org-123/users?returnRoles=false');
      expect(mockResponse.send).to.have.been.calledWith({ users: [] });
    });

    it('should handle errors and return 500 status', async () => {
      mockRequest.query = { usersOrgId: 'test-org' };
      const error = { 
        data: { message: 'API Error' }, 
        status: 404,
        message: 'Not found',
        stack: 'Error stack',
        code: 'ERR_CODE'
      };
      mockRequest.http.get.rejects(error);
      
      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);
      
      expect(mockLogger.error).to.have.been.calledWith('Organisations error ' + error);
      expect(mockResponse.status).to.have.been.calledWith(500);
      expect(mockResponse.send).to.have.been.calledWith({
        apiError: 'API Error',
        apiStatusCode: 404,
        message: 'handleOrganisationUserListRoute error'
      });
    });
  });

  describe('module exports', () => {
    it('should export router', () => {
      const module = require('./index');
      
      expect(module.router).to.exist;
      expect(module.router).to.be.a('function');
      expect(module.router.stack).to.be.an('array');
      
      expect(module.default).to.exist;
      expect(module.default).to.equal(module.router);
    });

    it('should have GET route configured', () => {
      const module = require('./index');
      const router = module.router;
      
      expect(router.stack).to.have.length(1);
      
      const route = router.stack[0];
      expect(route.route).to.exist;
      expect(route.route.path).to.equal('/');
      expect(route.route.methods.get).to.be.true;
      
      expect(route.route.stack).to.have.length(1);
      expect(route.route.stack[0].handle).to.be.a('function');
    });
  });
});