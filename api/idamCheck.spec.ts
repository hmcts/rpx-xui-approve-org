import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('idamCheck', () => {
  let configStub: any;
  let httpStub: any;
  let axiosGetStub: any;
  let processExitStub: any;
  let consoleLogStub: any;

  beforeEach(() => {
    configStub = sinon.stub();
    configStub.withArgs('services.idamApi').returns('http://idam-api.example.com');
    
    axiosGetStub = sinon.stub();
    httpStub = sinon.stub().returns({ get: axiosGetStub });
    
    processExitStub = sinon.stub(process, 'exit');
    consoleLogStub = sinon.stub(console, 'log');
    
    sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configStub);
    sinon.stub(require('./lib/http'), 'http').callsFake(httpStub);
  });

  afterEach(() => {
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
      expect(processExitStub).not.to.have.been.called;
      expect(consoleLogStub).not.to.have.been.called;
    });

    it('should exit process when IDAM API returns no result', async () => {
      axiosGetStub.resolves(null);

      const resolveStub = sinon.stub();
      const rejectStub = sinon.stub();

      await idamCheck(resolveStub, rejectStub);

      expect(configStub).to.have.been.calledOnce;
      expect(configStub).to.have.been.calledWith('services.idamApi');
      expect(httpStub).to.have.been.calledOnce;
      expect(httpStub).to.have.been.calledWith({});
      expect(axiosGetStub).to.have.been.calledOnce;
      expect(axiosGetStub).to.have.been.calledWith('http://idam-api.example.com/o/.well-known/openid-configuration');
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWithExactly('idam api must be up to start');
      expect(processExitStub).to.have.been.calledOnce;
      expect(processExitStub).to.have.been.calledWithExactly(1);
      expect(resolveStub).to.have.been.calledOnce;
      expect(resolveStub).to.have.been.calledWithExactly();
      expect(rejectStub).not.to.have.been.called;
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
      expect(processExitStub).not.to.have.been.called;
      expect(consoleLogStub).not.to.have.been.called;
    });
  });
});