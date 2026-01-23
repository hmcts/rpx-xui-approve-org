import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('idamCheck', () => {
  let configStub: any;
  let httpStub: any;
  let axiosGetStub: any;
  let loggerStub: any;
  let processExitStub: sinon.SinonStub;
  let clock: sinon.SinonFakeTimers;
  let idamCheckBaseDelay: number;
  let idamCheckMaxDuration: number;

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
    clock = sinon.useFakeTimers({ now: 0 });

    sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configStub);
    sinon.stub(require('./lib/http'), 'http').callsFake(httpStub);
    sinon.stub(require('./lib/log4jui'), 'getLogger').returns(loggerStub);
  });

  afterEach(() => {
    clock.restore();
    processExitStub.restore();
    sinon.restore();
  });

  describe('idamCheck function', () => {
    let idamCheck: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./idamCheck')];
      const module = require('./idamCheck');
      idamCheck = module.idamCheck;
      idamCheckBaseDelay = module.IDAM_CHECK_BASE_DELAY_MS;
      idamCheckMaxDuration = module.IDAM_CHECK_MAX_DURATION_MS;
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

      const idamCheckPromise = idamCheck(resolveStub, rejectStub);
      await Promise.resolve(); // allow first attempt to schedule retry
      clock.tick(idamCheckBaseDelay);
      await idamCheckPromise;

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

      const idamCheckPromise = idamCheck(resolveStub, rejectStub);
      await Promise.resolve(); // allow first attempt to schedule retry
      for (let elapsed = 0; elapsed <= idamCheckMaxDuration; elapsed += idamCheckBaseDelay) {
        clock.tick(idamCheckBaseDelay);
        await Promise.resolve(); // let the retry loop progress between ticks
      }
      await idamCheckPromise;

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
