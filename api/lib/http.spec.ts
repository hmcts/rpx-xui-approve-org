import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { Request } from 'express';
import { http } from './http';
import { createAxiosMock, createMockAxiosInstance } from '../test/shared/httpMocks';

describe('http', () => {
  let axiosMock: any;
  let mockAxiosInstance: any;
  let interceptorsStub: any;

  beforeEach(() => {
    mockAxiosInstance = createMockAxiosInstance();
    axiosMock = createAxiosMock();
    axiosMock.create.returns(mockAxiosInstance);

    interceptorsStub = {
      requestInterceptor: sinon.stub(),
      successInterceptor: sinon.stub(),
      errorInterceptor: sinon.stub()
    };

    sinon.stub(require('axios'), 'create').callsFake(axiosMock.create);
    sinon.stub(require('axios'), 'defaults').value(axiosMock.defaults);
    sinon.stub(require('./interceptors'), 'requestInterceptor').value(interceptorsStub.requestInterceptor);
    sinon.stub(require('./interceptors'), 'successInterceptor').value(interceptorsStub.successInterceptor);
    sinon.stub(require('./interceptors'), 'errorInterceptor').value(interceptorsStub.errorInterceptor);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('http factory function', () => {
    it('should create axios instance with default headers', () => {
      const mockRequest = {
        headers: {}
      } as unknown as Request;

      const axiosInstance = http(mockRequest);

      expect(axiosMock.create).to.have.been.calledWith({
        headers: {}
      });
      expect(axiosInstance).to.equal(mockAxiosInstance);
    });

    it('should include Authorization header when present in request', () => {
      const mockRequest = {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      } as unknown as Request;

      http(mockRequest);

      expect(axiosMock.create).to.have.been.calledWith({
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    it('should include ServiceAuthorization header when present in request', () => {
      const mockRequest = {
        headers: {
          'ServiceAuthorization': 'Bearer s2s-token'
        }
      } as unknown as Request;

      http(mockRequest);

      expect(axiosMock.create).to.have.been.calledWith({
        headers: {
          'ServiceAuthorization': 'Bearer s2s-token'
        }
      });
    });

    it('should include user-roles header when present in request', () => {
      const mockRequest = {
        headers: {
          'user-roles': ['admin', 'user']
        }
      } as any;

      http(mockRequest);

      expect(axiosMock.create).to.have.been.calledWith({
        headers: {
          'user-roles': ['admin', 'user']
        }
      });
    });

    it('should include all relevant headers when present', () => {
      const mockRequest = {
        headers: {
          'Authorization': 'Bearer test-token',
          'ServiceAuthorization': 'Bearer s2s-token',
          'user-roles': ['admin'],
          'Content-Type': 'application/json', // Should not be included
          'Other-Header': 'value' // Should not be included
        }
      } as any;

      http(mockRequest);

      expect(axiosMock.create).to.have.been.calledWith({
        headers: {
          'Authorization': 'Bearer test-token',
          'ServiceAuthorization': 'Bearer s2s-token',
          'user-roles': ['admin']
        }
      });
    });

    it('should handle request with no headers', () => {
      const mockRequest = {} as Request;

      http(mockRequest);

      expect(axiosMock.create).to.have.been.calledWith({
        headers: {}
      });
    });

    it('should skip user-roles header when empty', () => {
      const mockRequest = {
        headers: {
          'user-roles': []
        }
      } as any;

      http(mockRequest);

      expect(axiosMock.create).to.have.been.calledWith({
        headers: {}
      });
    });

    it('should attach request interceptor', () => {
      const mockRequest = {} as Request;

      http(mockRequest);

      expect(mockAxiosInstance.interceptors.request.use).to.have.been.calledWith(
        interceptorsStub.requestInterceptor
      );
    });

    it('should attach response interceptors', () => {
      const mockRequest = {} as Request;

      http(mockRequest);

      expect(mockAxiosInstance.interceptors.response.use).to.have.been.calledWith(
        interceptorsStub.successInterceptor,
        interceptorsStub.errorInterceptor
      );
    });
  });
});