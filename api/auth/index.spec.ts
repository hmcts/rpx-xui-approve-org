import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { attach } from './index';
import { createMockEnhancedRequest, createMockResponse, createMockNextFunction } from '../test/shared/authMocks';
import { createMockAxiosInstance } from '../test/shared/httpMocks';
import { createConfigMock } from '../test/shared/configMocks';

describe('auth/index', () => {
  let configMock: any;
  let httpStub: any;
  let mockAxiosInstance: any;
  let xuiNodeStub: any;
  let authStub: any;

  beforeEach(() => {
    configMock = createConfigMock({
      'cookies.roles': 'roles'
    });

    mockAxiosInstance = createMockAxiosInstance();
    httpStub = sinon.stub().returns(mockAxiosInstance);

    authStub = {
      EVENT: {
        AUTHENTICATE_SUCCESS: 'auth.authenticate.success'
      }
    };

    xuiNodeStub = {
      on: sinon.stub()
    };

    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
    sinon.stub(require('../lib/http'), 'http').callsFake(httpStub);
    const rpxXuiNodeLib = require('@hmcts/rpx-xui-node-lib');
    sinon.stub(rpxXuiNodeLib, 'xuiNode').value(xuiNodeStub);
    
    if (!rpxXuiNodeLib.AUTH) {
      rpxXuiNodeLib.AUTH = authStub;
    } else {
      Object.assign(rpxXuiNodeLib.AUTH, authStub);
    }
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('attach middleware', () => {
    it('should attach http client to request when not present', async () => {
      const mockRequest = createMockEnhancedRequest({
        http: undefined
      });
      const mockResponse = createMockResponse();
      const mockNext = createMockNextFunction();

      await attach(mockRequest as any, mockResponse as any, mockNext);

      expect(httpStub).to.have.been.calledWith(mockRequest);
      expect(mockRequest.http).to.equal(mockAxiosInstance);
      expect(mockNext).to.have.been.called;
    });

    it('should not replace existing http client', async () => {
      const existingHttpClient = createMockAxiosInstance();
      const mockRequest = createMockEnhancedRequest({
        http: existingHttpClient
      });
      const mockResponse = createMockResponse();
      const mockNext = createMockNextFunction();

      await attach(mockRequest as any, mockResponse as any, mockNext);

      expect(httpStub).not.to.have.been.called;
      expect(mockRequest.http).to.equal(existingHttpClient);
      expect(mockNext).to.have.been.called;
    });

    it('should always call next function', async () => {
      const mockRequest = createMockEnhancedRequest();
      const mockResponse = createMockResponse();
      const mockNext = createMockNextFunction();

      const result = await attach(mockRequest as any, mockResponse as any, mockNext);

      expect(mockNext).to.have.been.calledOnce;
      expect(mockNext).to.have.been.calledWith(); // Called with no arguments
      expect(result).to.be.undefined; // Function doesn't return anything
    });
  });

  describe('success callback registration', () => {
    it('should register authentication success event handler', () => {
      // Re-import to trigger event registration
      delete require.cache[require.resolve('./index')];
      require('./index');

      expect(xuiNodeStub.on).to.have.been.calledOnce;
      expect(xuiNodeStub.on).to.have.been.calledWith(
        'auth.authenticate.success',
        sinon.match.func
      );
      
      // Verify the callback is the correct function by checking its behavior
      const registeredCallback = xuiNodeStub.on.getCall(0).args[1];
      expect(registeredCallback).to.be.a('function');
      expect(registeredCallback.length).to.equal(3); // Should accept req, res, next
    });
  });

  describe('success callback function', () => {
    let successCallback: any;

    beforeEach(() => {
      // Re-import to get fresh callback registration
      delete require.cache[require.resolve('./index')];
      require('./index');
      
      // Extract the callback function from the xuiNode.on call
      successCallback = xuiNodeStub.on.getCall(0).args[1];
    });

    it('should set roles cookie and redirect when not refresh', () => {
      const mockRequest = createMockEnhancedRequest({
        session: {
          passport: {
            user: {
              userinfo: { roles: ['admin', 'user'] }
            }
          }
        },
        isRefresh: false
      });
      const mockResponse = createMockResponse();
      const mockNext = createMockNextFunction();

      const result = successCallback(mockRequest, mockResponse, mockNext);

      expect(mockResponse.cookie).to.have.been.calledOnce;
      expect(mockResponse.cookie).to.have.been.calledWith('roles', ['admin', 'user']);
      
      expect(mockResponse.redirect).to.have.been.calledOnce;
      expect(mockResponse.redirect).to.have.been.calledWith('/');
      
      expect(mockNext).not.to.have.been.called;
      
      expect(result).to.not.be.undefined;
    });

    it('should set roles cookie and call next when is refresh', () => {
      const mockRequest = createMockEnhancedRequest({
        session: {
          passport: {
            user: {
              userinfo: { roles: ['admin', 'user'] }
            }
          }
        },
        isRefresh: true
      });
      const mockResponse = createMockResponse();
      const mockNext = createMockNextFunction();

      const result = successCallback(mockRequest, mockResponse, mockNext);

      expect(mockResponse.cookie).to.have.been.calledOnce;
      expect(mockResponse.cookie).to.have.been.calledWith('roles', ['admin', 'user']);
      
      // Verify no redirect when isRefresh is true
      expect(mockResponse.redirect).not.to.have.been.called;
      
      expect(mockNext).to.have.been.calledOnce;
      expect(mockNext).to.have.been.calledWith();
      
      expect(result).to.be.undefined;
    });

    it('should handle missing roles gracefully', () => {
      const mockRequest = createMockEnhancedRequest({
        session: {
          passport: {
            user: {
              userinfo: { roles: undefined }
            }
          }
        },
        isRefresh: false
      });
      const mockResponse = createMockResponse();
      const mockNext = createMockNextFunction();

      expect(() => successCallback(mockRequest, mockResponse, mockNext)).not.to.throw();
      
      expect(mockResponse.cookie).to.have.been.calledOnce;
      expect(mockResponse.cookie).to.have.been.calledWith('roles', undefined);
      
      expect(mockResponse.redirect).to.have.been.calledOnce;
      expect(mockResponse.redirect).to.have.been.calledWith('/');
      expect(mockNext).not.to.have.been.called;
    });

    it('should handle different role types gracefully', () => {
      const testCases = [
        { roles: [] },
        { roles: null },
        { roles: ['single-role'] },
        { roles: ['role1', 'role2', 'role3'] }
      ];

      testCases.forEach(({ roles }) => {
        const mockRequest = createMockEnhancedRequest({
          session: {
            passport: {
              user: {
                userinfo: { roles }
              }
            }
          },
          isRefresh: true
        });
        const mockResponse = createMockResponse();
        const mockNext = createMockNextFunction();

        expect(() => successCallback(mockRequest, mockResponse, mockNext)).not.to.throw();
        expect(mockResponse.cookie).to.have.been.calledWith('roles', roles);
      });
    });
  });
});