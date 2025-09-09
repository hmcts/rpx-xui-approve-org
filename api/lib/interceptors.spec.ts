import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { requestInterceptor, successInterceptor, errorInterceptor } from './interceptors';
import { createMockLogger } from '../test/shared/loggerMocks';
import { createConfigMock } from '../test/shared/configMocks';

describe('interceptors', () => {
  let mockLogger: any;
  let configMock: any;
  let log4juiStub: any;

  beforeEach(() => {
    mockLogger = createMockLogger();
    configMock = createConfigMock({
      'MAX_LOG_LINE': 100
    });
    log4juiStub = {
      getLogger: sinon.stub().returns(mockLogger)
    };

    sinon.stub(require('./log4jui'), 'getLogger').callsFake(log4juiStub.getLogger);
    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('requestInterceptor', () => {
    it('should log outgoing request with method and URL', () => {
      const mockRequest = {
        method: 'get',
        url: 'http://example.com/api/test',
        metadata: undefined
      };

      const result = requestInterceptor(mockRequest);

      expect(log4juiStub.getLogger).to.have.been.calledWith('outgoing');
      expect(mockLogger.info).to.have.been.calledWith('GET to http://example.com/api/test');
      expect(result).to.equal(mockRequest);
    });

    it('should add timing metadata to request', () => {
      const mockRequest = {
        method: 'post',
        url: 'http://example.com/api/test'
      };

      const result = requestInterceptor(mockRequest);

      expect(result.metadata).to.have.property('startTime');
      expect(result.metadata.startTime).to.be.an.instanceOf(Date);
    });
  });

  describe('successInterceptor', () => {
    it('should calculate and set response duration', () => {
      const startTime = new Date('2023-01-01T10:00:00.000Z');
      const endTime = new Date('2023-01-01T10:00:01.500Z');

      sinon.useFakeTimers(endTime);

      const mockResponse = {
        config: {
          method: 'GET',
          url: 'http://example.com/api/test',
          metadata: { startTime }
        },
        status: 200,
        statusText: 'OK'
      };

      const result = successInterceptor(mockResponse);

      expect(result.config.metadata.endTime).to.be.an.instanceOf(Date);
      expect(result.duration).to.equal(1500); // 1.5 seconds in milliseconds
      expect(result).to.equal(mockResponse);

      sinon.restore();
    });

    it('should log successful response with trackRequest', () => {
      const mockResponse = {
        config: {
          method: 'GET',
          url: 'http://example.com/api/test',
          metadata: { startTime: new Date() }
        },
        status: 200,
        statusText: 'OK'
      };

      successInterceptor(mockResponse);

      expect(log4juiStub.getLogger).to.have.been.calledWith('return');
      expect(mockLogger.trackRequest).to.have.been.calledOnce;

      const trackRequestCall = mockLogger.trackRequest.getCall(0).args[0];
      expect(trackRequestCall).to.have.property('duration');
      expect(trackRequestCall).to.have.property('name', 'Service GET call');
      expect(trackRequestCall).to.have.property('resultCode', 200);
      expect(trackRequestCall).to.have.property('success', true);
      expect(trackRequestCall).to.have.property('url', 'http://example.com/api/test');
    });
  });

  describe('errorInterceptor', () => {
    it('should log error details and re-throw error', () => {
      const mockError = {
        message: 'Network Error',
        status: 500,
        config: {
          method: 'POST',
          url: 'http://example.com/api/test',
          metadata: { startTime: new Date() }
        },
        response: {
          status: 500,
          statusText: 'Internal Server Error'
        }
      };

      expect(() => errorInterceptor(mockError)).to.throw(Error);

      expect(log4juiStub.getLogger).to.have.been.calledWith('return');
      expect(mockLogger.trackRequest).to.have.been.calledOnce;

      const trackRequestCall = mockLogger.trackRequest.getCall(0).args[0];
      expect(trackRequestCall).to.have.property('duration');
      expect(trackRequestCall).to.have.property('name', 'Service POST call');
      expect(trackRequestCall).to.have.property('resultCode', 500);
      expect(trackRequestCall).to.have.property('url', 'http://example.com/api/test');
    });

    it('should handle error without response', async () => {
      const mockError = {
        message: 'Network Error',
        config: {
          method: 'GET',
          url: 'http://example.com/api/test',
          metadata: { startTime: new Date() }
        }
      };

      try {
        const result = errorInterceptor(mockError);
        await result;
        expect.fail('Expected errorInterceptor to throw or reject');
      } catch (rejectedValue) {
        expect(rejectedValue).to.be.an('object');
        expect(rejectedValue).to.have.property('message', 'No api response');
        expect(rejectedValue).to.have.property('url');
      }

      expect(mockLogger.trackRequest).to.have.been.calledOnce;
      const trackRequestCall = mockLogger.trackRequest.getCall(0).args[0];
      expect(trackRequestCall).to.have.property('duration');
      expect(trackRequestCall).to.have.property('name', 'Service GET call');
      expect(trackRequestCall).to.have.property('resultCode', undefined);
    });

    it('should format exception and log error message', async () => {
      const mockError = {
        message: 'Network Error',
        stack: 'Error stack trace',
        config: {
          method: 'GET',
          url: 'http://example.com/api/test',
          metadata: { startTime: new Date() }
        },
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      };

      try {
        const result = errorInterceptor(mockError);
        await result;
        expect.fail('Expected errorInterceptor to throw or reject');
      } catch (rejectedValue) {
        expect(rejectedValue).to.be.an('object');
        expect(rejectedValue).to.have.property('status', 500);
        expect(rejectedValue).to.have.property('data');
      }

      expect(mockLogger.error).to.have.been.calledOnce;
      const errorCall = mockLogger.error.getCall(0).args[0];
      expect(errorCall).to.include('Error on GET to http://example.com/api/test');
    });
  });
});
