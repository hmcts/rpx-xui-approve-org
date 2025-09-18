import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('lib/tunnel', () => {
  let showFeatureStub: any;
  let createGlobalProxyAgentStub: any;
  let mockLogger: any;
  let getLoggerStub: any;
  let originalEnv: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./tunnel')];
    delete require.cache[require.resolve('../configuration')];
    delete require.cache[require.resolve('./log4jui')];

    originalEnv = {
      AO_HTTP_PROXY: process.env.AO_HTTP_PROXY,
      AO_NO_PROXY: process.env.AO_NO_PROXY
    };

    showFeatureStub = sinon.stub();
    createGlobalProxyAgentStub = sinon.stub();
    mockLogger = {
      info: sinon.stub()
    };
    getLoggerStub = sinon.stub().returns(mockLogger);

    sinon.stub(require('../configuration'), 'showFeature').callsFake(showFeatureStub);
    sinon.stub(require('global-agent'), 'createGlobalProxyAgent').callsFake(createGlobalProxyAgentStub);
    sinon.stub(require('./log4jui'), 'getLogger').callsFake(getLoggerStub);
  });

  afterEach(() => {
    sinon.restore();

    delete require.cache[require.resolve('./tunnel')];
    delete require.cache[require.resolve('../configuration')];
    delete require.cache[require.resolve('./log4jui')];

    if (originalEnv.AO_HTTP_PROXY !== undefined) {
      process.env.AO_HTTP_PROXY = originalEnv.AO_HTTP_PROXY;
    } else {
      delete process.env.AO_HTTP_PROXY;
    }

    if (originalEnv.AO_NO_PROXY !== undefined) {
      process.env.AO_NO_PROXY = originalEnv.AO_NO_PROXY;
    } else {
      delete process.env.AO_NO_PROXY;
    }
  });

  describe('init', () => {
    it('should create logger with correct category', () => {
      showFeatureStub.returns(false);

      delete require.cache[require.resolve('./tunnel')];
      const { init } = require('./tunnel');
      init();

      expect(getLoggerStub).to.have.been.calledWith('proxy');
    });

    it('should configure global proxy agent when feature is enabled', () => {
      showFeatureStub.returns(true);
      process.env.AO_HTTP_PROXY = 'http://proxy.example.com:8080';
      process.env.AO_NO_PROXY = 'localhost,127.0.0.1';

      delete require.cache[require.resolve('./tunnel')];
      const { init } = require('./tunnel');
      init();

      expect(showFeatureStub).to.have.been.calledWith('proxyEnabled');
    });

    it('should not configure global proxy agent when feature is disabled', () => {
      showFeatureStub.returns(false);

      const { init } = require('./tunnel');
      init();

      expect(createGlobalProxyAgentStub).not.to.have.been.called;
    });

    it('should log proxy configuration when feature is enabled', () => {
      showFeatureStub.returns(true);
      process.env.AO_HTTP_PROXY = 'http://proxy.example.com:8080';
      process.env.AO_NO_PROXY = 'localhost,127.0.0.1';

      const { init } = require('./tunnel');
      init();

      expect(mockLogger.info).to.have.been.calledWith(
        'configuring global-agent: ',
        'http://proxy.example.com:8080',
        ' no proxy: ',
        'localhost,127.0.0.1'
      );
    });

    it('should handle undefined proxy environment variables', () => {
      showFeatureStub.returns(true);
      delete process.env.AO_HTTP_PROXY;
      delete process.env.AO_NO_PROXY;

      const { init } = require('./tunnel');
      init();

      expect(mockLogger.info).to.have.been.calledWith(
        'configuring global-agent: ',
        undefined,
        ' no proxy: ',
        undefined
      );
    });

    it('should check correct feature flag', () => {
      showFeatureStub.returns(false);

      const { init } = require('./tunnel');
      init();

      expect(showFeatureStub).to.have.been.calledWith('proxyEnabled');
    });

    it('should handle only HTTP_PROXY set', () => {
      showFeatureStub.returns(true);
      process.env.AO_HTTP_PROXY = 'http://proxy.example.com:8080';
      delete process.env.AO_NO_PROXY;

      const { init } = require('./tunnel');
      init();

      expect(mockLogger.info).to.have.been.calledWith(
        'configuring global-agent: ',
        'http://proxy.example.com:8080',
        ' no proxy: ',
        undefined
      );
    });

    it('should handle only NO_PROXY set', () => {
      showFeatureStub.returns(true);
      delete process.env.AO_HTTP_PROXY;
      process.env.AO_NO_PROXY = 'localhost,127.0.0.1';

      const { init } = require('./tunnel');
      init();

      expect(mockLogger.info).to.have.been.calledWith(
        'configuring global-agent: ',
        undefined,
        ' no proxy: ',
        'localhost,127.0.0.1'
      );
    });
  });
});
