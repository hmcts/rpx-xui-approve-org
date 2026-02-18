import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';
import { createMockAxiosInstance, createMockAxiosResponse } from '../test/shared/httpMocks';
import { MICROSERVICE, S2S_SECRET, SERVICE_S2S_PATH } from '../configuration/references';

describe('serviceAuth', () => {
  let postS2SLease: any;
  let mockLogger: any;
  let getLoggerStub: sinon.SinonStub;
  let getConfigValueStub: sinon.SinonStub;
  let httpStub: any;
  let mockAxiosInstance: any;
  let otpStub: sinon.SinonStub;
  let otpTotpStub: sinon.SinonStub;
  let otpModulePath: string;
  let originalOtpExport: any;

  beforeEach(() => {
    mockLogger = createMockLogger();
    getLoggerStub = sinon.stub().returns(mockLogger);
    getConfigValueStub = sinon.stub();
    getConfigValueStub.withArgs(SERVICE_S2S_PATH).returns('http://localhost:4502');
    getConfigValueStub.withArgs(S2S_SECRET).returns('  test-secret-key  ');
    getConfigValueStub.withArgs(MICROSERVICE).returns('xui_approveorg');

    mockAxiosInstance = createMockAxiosInstance();
    httpStub = sinon.stub().returns(mockAxiosInstance);

    otpTotpStub = sinon.stub().returns('123456');
    otpStub = sinon.stub().returns({ totp: otpTotpStub });

    sinon.stub(require('../lib/log4jui'), 'getLogger').callsFake(getLoggerStub);
    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(getConfigValueStub);
    sinon.stub(require('../lib/http'), 'http').callsFake(httpStub);

    otpModulePath = require.resolve('otp');
    originalOtpExport = require(otpModulePath);
    require.cache[otpModulePath].exports = otpStub;

    delete require.cache[require.resolve('./serviceAuth')];
    postS2SLease = require('./serviceAuth').postS2SLease;
  });

  afterEach(() => {
    if (otpModulePath && require.cache[otpModulePath]) {
      require.cache[otpModulePath].exports = originalOtpExport;
    }
    delete require.cache[require.resolve('./serviceAuth')];
    sinon.restore();
  });

  describe('postS2SLease', () => {
    it('should successfully generate S2S token', async () => {
      const mockResponse = createMockAxiosResponse('test-s2s-token');
      mockAxiosInstance.post.resolves(mockResponse);

      const result = await postS2SLease();

      expect(result).to.equal('test-s2s-token');
    });

    it('should create HTTP client with empty auth token', async () => {
      const mockResponse = createMockAxiosResponse('test-token');
      mockAxiosInstance.post.resolves(mockResponse);

      await postS2SLease();

      expect(httpStub).to.have.been.calledWith(
        sinon.match({
          session: {
            auth: {
              token: ''
            }
          }
        })
      );
    });

    it('should generate OTP from trimmed secret', async () => {
      const mockResponse = createMockAxiosResponse('test-token');
      mockAxiosInstance.post.resolves(mockResponse);

      await postS2SLease();

      expect(otpStub).to.have.been.calledWith({
        secret: 'test-secret-key' // Should be trimmed
      });
      expect(otpTotpStub).to.have.been.calledOnce;
    });

    it('should post to correct S2S endpoint with microservice and OTP', async () => {
      const mockResponse = createMockAxiosResponse('test-token');
      mockAxiosInstance.post.resolves(mockResponse);

      await postS2SLease();

      expect(mockAxiosInstance.post).to.have.been.calledWith(
        'http://localhost:4502/lease',
        {
          microservice: 'xui_approveorg',
          oneTimePassword: '123456'
        }
      );
    });

    it('should log generation details', async () => {
      const mockResponse = createMockAxiosResponse('test-token');
      mockAxiosInstance.post.resolves(mockResponse);

      await postS2SLease();

      expect(getLoggerStub).to.have.been.calledWith('service auth');
      expect(mockLogger.info).to.have.been.calledWith(
        'generating from secret  :',
        'test-secret-key',
        'xui_approveorg',
        '123456'
      );
      expect(mockLogger.info).to.have.been.calledWith(
        'Generated from secret: ' + mockResponse
      );
    });

    it('should handle and log errors with message', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.post.rejects(error);

      try {
        await postS2SLease();
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).to.equal(error);
        expect(mockLogger.error).to.have.been.calledWith(error);
        expect(mockLogger.error).to.have.been.calledWith('Some error adn');
        expect(mockLogger.error).to.have.been.calledWith('Error message: Network error');
      }
    });

    it('should log error stack when available', async () => {
      const error = new Error('Network error');
      error.stack = 'Error stack trace';
      mockAxiosInstance.post.rejects(error);

      try {
        await postS2SLease();
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(mockLogger.error).to.have.been.calledWith('Error stack: Error stack trace');
      }
    });

    it('should log error code when available', async () => {
      const error: any = new Error('Network error');
      error.code = 'ECONNREFUSED';
      mockAxiosInstance.post.rejects(error);

      try {
        await postS2SLease();
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(mockLogger.error).to.have.been.calledWith('Error code: ECONNREFUSED');
      }
    });

    it('should handle errors without message, stack, or code', async () => {
      const error = {};
      mockAxiosInstance.post.rejects(error);

      try {
        await postS2SLease();
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(mockLogger.error).to.have.been.calledWith(error);
        expect(mockLogger.error).to.have.been.calledWith('Some error adn');
        // Should not call message, stack, or code logging
        expect(mockLogger.error).not.to.have.been.calledWith(sinon.match(/Error message:/));
        expect(mockLogger.error).not.to.have.been.calledWith(sinon.match(/Error stack:/));
        expect(mockLogger.error).not.to.have.been.calledWith(sinon.match(/Error code:/));
      }
    });
  });
});
