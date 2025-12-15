import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('idamCheck', () => {
  let configStub: any;
  let httpStub: any;
  let axiosGetStub: any;
  let loggerStub: any;
  let processExitStub: sinon.SinonStub;
  let setTimeoutStub: sinon.SinonStub;
  let dateNowStub: sinon.SinonStub;
  let currentTime: number;

  beforeEach(() => {
    configStub = sinon.stub();
    configStub.withArgs('services.idamApi').returns('http://idam-api.example.com');

    axiosGetStub = sinon.stub();
    httpStub = sinon.stub().returns({ get: axiosGetStub });

    loggerStub = {
      warn: sinon.stub(),
      error: sinon.stub(),
      info: sinon.stub(),
      debug: sinon.stub(),
      trackRequest: sinon.stub()
    };
    processExitStub = sinon.stub(process, 'exit');
    currentTime = 0;
    dateNowStub = sinon.stub(Date, 'now').callsFake(() => currentTime);
    setTimeoutStub = sinon.stub(global, 'setTimeout').callsFake(((fn: any, delay?: number, ...args: any[]) => {
      const waitTime = typeof delay === 'number' ? delay : 0;
      currentTime += waitTime;
      if (typeof fn === 'function') {
        fn(...args);
      }
      return 0 as unknown as NodeJS.Timeout;
    }) as any);

    sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configStub);
    sinon.stub(require('./lib/http'), 'http').callsFake(httpStub);
    sinon.stub(require('./lib/log4jui'), 'getLogger').returns(loggerStub);
  });

  afterEach(() => {
    dateNowStub.restore();
    setTimeoutStub.restore();
    processExitStub.restore();
    sinon.restore();
  });

  describe('idamCheck function', () => {
    let idamCheck: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./idamCheck')];
      const module = require('./idamCheck');
      idamCheck = module.idamCheck;
    });

    it('should resolve successfully when IDAM API responds', async () => {
      const mockResponse = { data: { issuer: 'http://idam-api.example.com/o' } };
      axiosGetStub.resolves(mockResponse);

      const resolveStub = sinon.stub();
      const rejectStub = sinon.stub();

      await idamCheck(resolveStub, rejectStub);

      expect(configStub).to.have.been.calledOnce;
      expect(configStub).to.have.been.calledWith('services.idamApi');
      expect(httpStub).to.have.been.calledOnce;
      expect(httpStub).to.have.been.calledWith({});
      expect(axiosGetStub).to.have.been.calledOnce;
      expect(axiosGetStub).to.have.been.calledWith('http://idam-api.example.com/o/.well-known/openid-configuration');
      expect(resolveStub).to.have.been.calledOnce;
      expect(resolveStub).to.have.been.calledWithExactly();
      expect(rejectStub).not.to.have.been.called;
      expect(loggerStub.warn).not.to.have.been.called;
      expect(loggerStub.error).not.to.have.been.called;
      expect(processExitStub).not.to.have.been.called;
    });

    it('should retry on transient failure and eventually resolve', async () => {
      const mockResponse = { data: { issuer: 'http://idam-api.example.com/o' } };
      axiosGetStub.onFirstCall().rejects(new Error('502'));
      axiosGetStub.onSecondCall().resolves(mockResponse);

      const resolveStub = sinon.stub();
      const rejectStub = sinon.stub();

      await idamCheck(resolveStub, rejectStub);

      expect(configStub).to.have.been.calledOnce;
      expect(configStub).to.have.been.calledWith('services.idamApi');
      expect(httpStub).to.have.been.called;
      expect(axiosGetStub).to.have.been.calledTwice;
      expect(loggerStub.warn).to.have.been.calledWithMatch('attempt 1');
      expect(resolveStub).to.have.been.calledOnce;
      expect(resolveStub).to.have.been.calledWithExactly();
      expect(rejectStub).not.to.have.been.called;
      expect(processExitStub).not.to.have.been.called;
    });

    it('should handle different IDAM API URLs from configuration', async () => {
      configStub.withArgs('services.idamApi').returns('http://different-idam.example.com');
      const mockResponse = { data: { issuer: 'http://different-idam.example.com/o' } };
      axiosGetStub.resolves(mockResponse);

      const resolveStub = sinon.stub();
      const rejectStub = sinon.stub();

      await idamCheck(resolveStub, rejectStub);

      expect(configStub).to.have.been.calledOnce;
      expect(configStub).to.have.been.calledWith('services.idamApi');
      expect(httpStub).to.have.been.calledOnce;
      expect(httpStub).to.have.been.calledWith({});
      expect(axiosGetStub).to.have.been.calledOnce;
      expect(axiosGetStub).to.have.been.calledWithExactly('http://different-idam.example.com/o/.well-known/openid-configuration');
      expect(resolveStub).to.have.been.calledOnce;
      expect(resolveStub).to.have.been.calledWithExactly();
      expect(rejectStub).not.to.have.been.called;
      expect(loggerStub.warn).not.to.have.been.called;
      expect(loggerStub.error).not.to.have.been.called;
      expect(processExitStub).not.to.have.been.called;
    });

    it('should reject after exhausting retries', async () => {
      axiosGetStub.rejects(new Error('timeout'));

      const resolveStub = sinon.stub();
      const rejectStub = sinon.stub();

      await idamCheck(resolveStub, rejectStub);

      expect(configStub).to.have.been.calledOnce;
      expect(httpStub).to.have.been.calledOnce;
      expect(axiosGetStub.callCount).to.be.greaterThan(1);
      expect(resolveStub).not.to.have.been.called;
      expect(rejectStub).to.have.been.calledOnce;
      expect(loggerStub.warn).to.have.been.called;
      expect(loggerStub.error).to.have.been.calledOnce;
      expect(processExitStub).to.have.been.calledOnceWith(1);
    });
  });
});
