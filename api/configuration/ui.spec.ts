import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createConfigMock } from '../test/shared/configMocks';

describe('configuration/ui', () => {
  let configMock: any;
  let getEnvironmentStub: any;
  let getConfigValueStub: any;
  let showFeatureStub: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./ui')];
    delete require.cache[require.resolve('./index')];

    configMock = createConfigMock({
      'cookies.token': '__auth-token',
      'idamClient': 'xui_webapp',
      'oauthCallbackUrl': 'https://callback.example.com',
      'protocol': 'https',
      'services.idamWeb': 'https://idam-web.example.com',
      'secrets.rpx.launch-darkly-client-id': 'ld-test-client'
    });

    sinon.stub(require('config'), 'get').callsFake(configMock.getConfigValue);

    getEnvironmentStub = sinon.stub().returns('test');
    getConfigValueStub = sinon.stub().callsFake(configMock.getConfigValue);
    showFeatureStub = sinon.stub().returns(false);

    sinon.stub(require('./index'), 'getEnvironment').callsFake(getEnvironmentStub);
    sinon.stub(require('./index'), 'getConfigValue').callsFake(getConfigValueStub);
    sinon.stub(require('./index'), 'showFeature').callsFake(showFeatureStub);
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve('./ui')];
    delete require.cache[require.resolve('./index')];
  });

  describe('uiConfig', () => {
    it('should return complete UI configuration object', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config).to.deep.equal({
        configEnv: 'test',
        cookies: {
          token: '__auth-token'
        },
        idamClient: 'xui_webapp',
        oauthCallbackUrl: 'https://callback.example.com',
        oidcEnabled: false,
        protocol: 'https',
        services: {
          idamWeb: 'https://idam-web.example.com'
        },
        launchDarklyClientId: 'ld-test-client'
      });
    });

    it('should configure cookies correctly', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.cookies).to.deep.equal({
        token: '__auth-token'
      });
    });

    it('should configure services correctly', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.services).to.deep.equal({
        idamWeb: 'https://idam-web.example.com'
      });
    });

    it('should handle feature flags correctly', () => {
      showFeatureStub.withArgs('oidcEnabled').returns(true);

      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.oidcEnabled).to.be.true;
    });

    it('should handle disabled feature flags', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.oidcEnabled).to.be.false;
    });

    it('should include all basic configuration values', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.configEnv).to.equal('test');
      expect(config.idamClient).to.equal('xui_webapp');
      expect(config.oauthCallbackUrl).to.equal('https://callback.example.com');
      expect(config.protocol).to.equal('https');
      expect(config.launchDarklyClientId).to.equal('ld-test-client');
    });

    it('should handle missing configuration values gracefully', () => {
      getEnvironmentStub.returns(undefined);
      getConfigValueStub.returns(undefined);
      showFeatureStub.returns(undefined);

      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.configEnv).to.be.undefined;
      expect(config.idamClient).to.be.undefined;
      expect(config.oauthCallbackUrl).to.be.undefined;
      expect(config.protocol).to.be.undefined;
      expect(config.launchDarklyClientId).to.be.undefined;

      expect(config.cookies.token).to.be.undefined;
      expect(config.services.idamWeb).to.be.undefined;

      expect(config.oidcEnabled).to.be.undefined;
    });

    it('should call configuration functions with correct arguments', () => {
      const { uiConfig } = require('./ui');
      uiConfig();

      expect(getEnvironmentStub).to.have.been.calledOnce;
      expect(getConfigValueStub).to.have.been.calledWith('cookies.token');
      expect(getConfigValueStub).to.have.been.calledWith('idamClient');
      expect(getConfigValueStub).to.have.been.calledWith('oauthCallbackUrl');
      expect(getConfigValueStub).to.have.been.calledWith('protocol');
      expect(getConfigValueStub).to.have.been.calledWith('services.idamWeb');
      expect(getConfigValueStub).to.have.been.calledWith('secrets.rpx.launch-darkly-client-id');

      expect(showFeatureStub).to.have.been.calledWith('oidcEnabled');
    });

    it('should preserve the structure for type safety', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config).to.have.all.keys([
        'configEnv', 'cookies', 'idamClient', 'oauthCallbackUrl', 'oidcEnabled',
        'protocol', 'services', 'launchDarklyClientId'
      ]);
      expect(config.cookies).to.have.all.keys(['token']);
      expect(config.services).to.have.all.keys(['idamWeb']);
    });
  });
});
