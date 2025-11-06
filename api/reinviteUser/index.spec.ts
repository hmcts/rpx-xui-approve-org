import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';
import { createMockEnhancedRequest, createMockResponse } from '../test/shared/authMocks';

describe('reinviteUser/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockLogger: any;
  let configStub: any;

  beforeEach(() => {
    mockRequest = createMockEnhancedRequest();
    mockRequest.query = { organisationId: 'test-org-123' };
    mockRequest.body = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      roles: ['admin']
    };

    mockResponse = createMockResponse();
    mockLogger = createMockLogger();
    configStub = sinon.stub().returns('https://rd-professional-api.example.com');

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);
    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('reinviteUserRoute', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should successfully reinvite user', async () => {
      const responseData = { message: 'User reinvited successfully' };
      mockRequest.http.post.resolves({ data: responseData });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(configStub).to.have.been.calledWith('services.rdProfessionalApi');
      expect(mockRequest.http.post).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/test-org-123/users/',
        mockRequest.body
      );
      expect(mockLogger.info).to.have.been.calledWith('response::', responseData);
      expect(mockResponse.send).to.have.been.calledWith(responseData);
    });

    it('should handle missing organisationId', async () => {
      mockRequest.query = {};
      const responseData = { message: 'User reinvited successfully' };
      mockRequest.http.post.resolves({ data: responseData });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockRequest.http.post).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/undefined/users/',
        mockRequest.body
      );
    });

    it('should handle different payload data', async () => {
      const customPayload = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        roles: ['user', 'admin']
      };
      mockRequest.body = customPayload;
      const responseData = { message: 'User reinvited successfully' };
      mockRequest.http.post.resolves({ data: responseData });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockRequest.http.post).to.have.been.calledWith(
        sinon.match.string,
        customPayload
      );
    });

    it('should handle API errors with complete error data', async () => {
      const error = {
        status: 400,
        data: {
          errorMessage: 'Invalid user data',
          errorDescription: 'The provided user data is invalid'
        }
      };
      mockRequest.http.post.rejects(error);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockLogger.info).to.have.been.calledWith('error', error);
      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith({
        apiError: 'Invalid user data',
        apiStatusCode: 400,
        message: 'The provided user data is invalid'
      });
    });

    it('should handle API errors with partial error data', async () => {
      const error = {
        status: 500,
        data: {
          errorMessage: 'Internal server error'
          // Missing errorDescription
        }
      };
      mockRequest.http.post.rejects(error);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledWith(500);
      expect(mockResponse.send).to.have.been.calledWith({
        apiError: 'Internal server error',
        apiStatusCode: 500,
        message: undefined
      });
    });

    it('should handle errors without data property', async () => {
      const error = {
        status: 404
        // Missing data property
      };
      mockRequest.http.post.rejects(error);

      const handler = router.stack[0].route.stack[0].handle;

      try {
        await handler(mockRequest, mockResponse);
      } catch (e) {
        // Error accessing error.data.errorMessage when data is undefined
        expect(mockLogger.info).to.have.been.calledWith('error', error);
      }
    });

    it('should use correct RD Professional API URL', async () => {
      configStub.returns('https://different-api.gov.uk');
      const responseData = { message: 'Success' };
      mockRequest.http.post.resolves({ data: responseData });

      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      const router = module.router;

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse);

      expect(mockRequest.http.post).to.have.been.calledWith(
        'https://different-api.gov.uk/refdata/internal/v1/organisations/test-org-123/users/',
        mockRequest.body
      );
    });
  });

  describe('module exports', () => {
    it('should export router', () => {
      const module = require('./index');
      expect(module.router).to.exist;
      expect(module.default).to.exist;
    });

    it('should have POST route configured for /', () => {
      const module = require('./index');
      const router = module.router;

      expect(router).to.be.a('function');
      expect(router.stack).to.be.an('array');
      expect(router.stack).to.have.length(1);
    });
  });
});
