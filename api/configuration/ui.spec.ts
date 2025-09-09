import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createConfigMock } from '../test/shared/configMocks';

describe('configuration/ui', () => {
  let configMock: any;
  let getEnvironmentStub: any;
  let getConfigValueStub: any;
  let showFeatureStub: any;
  let healthEndpointsStub: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./ui')];
    delete require.cache[require.resolve('./index')];
    delete require.cache[require.resolve('./health')];

    configMock = createConfigMock({
      'cookies.roles': '__user-roles',
      'cookies.token': '__auth-token',
      'cookies.userId': '__userid',
      'exceptionOptions.maxLines': '100',
      'idamClient': 'xui_webapp',
      'indexUrl': '/approve-organisation',
      'logging': 'debug',
      'maxLogLine': '80',
      'microservice': 'xui_webapp',
      'now': 'false',
      'oauthCallbackUrl': 'https://callback.example.com',
      'protocol': 'https',
      'services.ccdDataApi': 'https://ccd-data.example.com',
      'services.ccdDefApi': 'https://ccd-def.example.com',
      'services.feeAndPayApi': 'https://fee-pay.example.com',
      'services.idamApi': 'https://idam-api.example.com',
      'services.idamWeb': 'https://idam-web.example.com',
      'iss': 'https://iss.example.com',
      'services.rdProfessionalApi': 'https://rd-prof.example.com',
      'services.s2s': 'https://s2s.example.com',
      'services.prd.commondataApi': 'https://prd-common.example.com',
      'sessionSecret': 'test-session-secret',
      'secrets.rpx.launch-darkly-client-id': 'ld-test-client'
    });

    sinon.stub(require('config'), 'get').callsFake(configMock.getConfigValue);

    getEnvironmentStub = sinon.stub().returns('test');
    getConfigValueStub = sinon.stub().callsFake(configMock.getConfigValue);
    showFeatureStub = sinon.stub().returns(false);
    healthEndpointsStub = sinon.stub().returns({
      ccdDataApi: 'https://ccd-data.example.com/health',
      ccdDefApi: 'https://ccd-def.example.com/health',
      feeAndPayApi: 'https://fee-pay.example.com/health',
      idamApi: 'https://idam-api.example.com/health',
      idamWeb: 'https://idam-web.example.com/health',
      iss: 'https://iss.example.com/health',
      rdProfessionalApi: 'https://rd-prof.example.com/health',
      s2s: 'https://s2s.example.com/health'
    });

    // Stub all dependencies BEFORE any imports happen
    sinon.stub(require('./index'), 'getEnvironment').callsFake(getEnvironmentStub);
    sinon.stub(require('./index'), 'getConfigValue').callsFake(getConfigValueStub);
    sinon.stub(require('./index'), 'showFeature').callsFake(showFeatureStub);
    sinon.stub(require('./health'), 'healthEndpoints').callsFake(healthEndpointsStub);
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve('./ui')];
    delete require.cache[require.resolve('./index')];
    delete require.cache[require.resolve('./health')];
  });

  describe('uiConfig', () => {
    it('should return complete UI configuration object', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config).to.be.an('object');
      expect(config).to.have.property('configEnv', 'test');
      expect(config).to.have.property('cookies');
      expect(config).to.have.property('exceptionOptions');
      expect(config).to.have.property('health');
      expect(config).to.have.property('idamClient');
      expect(config).to.have.property('services');
    });

    it('should configure cookies correctly', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.cookies).to.deep.equal({
        roles: '__user-roles',
        token: '__auth-token',
        userId: '__userid'
      });
    });

    it('should configure exception options correctly', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.exceptionOptions).to.deep.equal({
        maxLines: '100'
      });
    });

    it('should include health endpoints from health module', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.health).to.deep.equal({
        ccdDataApi: 'https://ccd-data.example.com/health',
        ccdDefApi: 'https://ccd-def.example.com/health',
        feeAndPayApi: 'https://fee-pay.example.com/health',
        idamApi: 'https://idam-api.example.com/health',
        idamWeb: 'https://idam-web.example.com/health',
        iss: 'https://iss.example.com/health',
        rdProfessionalApi: 'https://rd-prof.example.com/health',
        s2s: 'https://s2s.example.com/health'
      });
      expect(healthEndpointsStub).to.have.been.calledOnce;
    });

    it('should configure services correctly', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.services).to.deep.equal({
        ccdDataApi: 'https://ccd-data.example.com',
        ccdDefApi: 'https://ccd-def.example.com',
        feeAndPayApi: 'https://fee-pay.example.com',
        idamApi: 'https://idam-api.example.com',
        idamWeb: 'https://idam-web.example.com',
        iss: 'https://iss.example.com',
        rdProfessionalApi: 'https://rd-prof.example.com',
        s2s: 'https://s2s.example.com',
        prd: {
          commondataApi: 'https://prd-common.example.com'
        }
      });
    });

    it('should handle feature flags correctly', () => {
      // Override the showFeature stub for this test
      showFeatureStub.callsFake((feature) => {
        return feature === 'oidcEnabled' || feature === 'secureCookieEnabled';
      });

      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.oidcEnabled).to.be.true;
      expect(config.secureCookie).to.be.true;
    });

    it('should handle disabled feature flags', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.oidcEnabled).to.be.false;
      expect(config.secureCookie).to.be.false;
    });

    it('should include all basic configuration values', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.configEnv).to.equal('test');
      expect(config.idamClient).to.equal('xui_webapp');
      expect(config.indexUrl).to.equal('/approve-organisation');
      expect(config.iss).to.equal('https://iss.example.com');
      expect(config.logging).to.equal('debug');
      expect(config.maxLogLine).to.equal('80');
      expect(config.microservice).to.equal('xui_webapp');
      expect(config.now).to.equal('false');
      expect(config.oauthCallbackUrl).to.equal('https://callback.example.com');
      expect(config.protocol).to.equal('https');
      expect(config.sessionSecret).to.equal('test-session-secret');
      expect(config.launchDarklyClientId).to.equal('ld-test-client');
    });

    it('should handle missing configuration values gracefully', () => {
      // Override stubs to return undefined/null for this test
      getEnvironmentStub.returns(null);
      getConfigValueStub.returns(undefined);
      showFeatureStub.returns(undefined);
      healthEndpointsStub.returns({});

      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.configEnv).to.be.null;

      expect(config.idamClient).to.be.undefined;
      expect(config.indexUrl).to.be.undefined;
      expect(config.iss).to.be.undefined;
      expect(config.logging).to.be.undefined;
      expect(config.maxLogLine).to.be.undefined;
      expect(config.microservice).to.be.undefined;
      expect(config.now).to.be.undefined;
      expect(config.oauthCallbackUrl).to.be.undefined;
      expect(config.protocol).to.be.undefined;
      expect(config.sessionSecret).to.be.undefined;
      expect(config.launchDarklyClientId).to.be.undefined;

      expect(config.cookies.roles).to.be.undefined;
      expect(config.cookies.token).to.be.undefined;
      expect(config.cookies.userId).to.be.undefined;

      expect(config.exceptionOptions.maxLines).to.be.undefined;

      expect(config.services.ccdDataApi).to.be.undefined;
      expect(config.services.ccdDefApi).to.be.undefined;
      expect(config.services.feeAndPayApi).to.be.undefined;
      expect(config.services.idamApi).to.be.undefined;
      expect(config.services.idamWeb).to.be.undefined;
      expect(config.services.iss).to.be.undefined;
      expect(config.services.rdProfessionalApi).to.be.undefined;
      expect(config.services.s2s).to.be.undefined;
      expect(config.services.prd.commondataApi).to.be.undefined;

      expect(config.oidcEnabled).to.be.undefined;
      expect(config.secureCookie).to.be.undefined;

      expect(config.health).to.deep.equal({});
    });

    it('should call configuration functions with correct arguments', () => {
      const { uiConfig } = require('./ui');
      uiConfig();

      expect(getEnvironmentStub).to.have.been.calledOnce;

      // Verify all getConfigValue calls
      expect(getConfigValueStub).to.have.been.calledWith('cookies.roles');
      expect(getConfigValueStub).to.have.been.calledWith('cookies.token');
      expect(getConfigValueStub).to.have.been.calledWith('cookies.userId');
      expect(getConfigValueStub).to.have.been.calledWith('exceptionOptions.maxLines');
      expect(getConfigValueStub).to.have.been.calledWith('idamClient');
      expect(getConfigValueStub).to.have.been.calledWith('indexUrl');
      expect(getConfigValueStub).to.have.been.calledWith('iss');
      expect(getConfigValueStub).to.have.been.calledWith('logging');
      expect(getConfigValueStub).to.have.been.calledWith('maxLogLine');
      expect(getConfigValueStub).to.have.been.calledWith('microservice');
      expect(getConfigValueStub).to.have.been.calledWith('now');
      expect(getConfigValueStub).to.have.been.calledWith('oauthCallbackUrl');
      expect(getConfigValueStub).to.have.been.calledWith('protocol');
      expect(getConfigValueStub).to.have.been.calledWith('services.ccdDataApi');
      expect(getConfigValueStub).to.have.been.calledWith('services.ccdDefApi');
      expect(getConfigValueStub).to.have.been.calledWith('services.feeAndPayApi');
      expect(getConfigValueStub).to.have.been.calledWith('services.idamApi');
      expect(getConfigValueStub).to.have.been.calledWith('services.idamWeb');
      expect(getConfigValueStub).to.have.been.calledWith('services.rdProfessionalApi');
      expect(getConfigValueStub).to.have.been.calledWith('services.s2s');
      expect(getConfigValueStub).to.have.been.calledWith('services.prd.commondataApi');
      expect(getConfigValueStub).to.have.been.calledWith('sessionSecret');
      expect(getConfigValueStub).to.have.been.calledWith('secrets.rpx.launch-darkly-client-id');

      // Verify showFeature calls
      expect(showFeatureStub).to.have.been.calledWith('oidcEnabled');
      expect(showFeatureStub).to.have.been.calledWith('secureCookieEnabled');

      // Verify healthEndpoints call
      expect(healthEndpointsStub).to.have.been.calledOnce;
    });

    it('should handle test environment', () => {
      getEnvironmentStub.returns('test');
      const { uiConfig } = require('./ui');
      const config = uiConfig();
      expect(config.configEnv).to.equal('test');
    });

    it('should handle development environment', () => {
      getEnvironmentStub.returns('development');
      delete require.cache[require.resolve('./ui')];
      const { uiConfig } = require('./ui');
      const config = uiConfig();
      expect(config.configEnv).to.equal('development');
    });

    it('should handle production environment', () => {
      getEnvironmentStub.returns('production');
      delete require.cache[require.resolve('./ui')];
      const { uiConfig } = require('./ui');
      const config = uiConfig();
      expect(config.configEnv).to.equal('production');
    });

    it('should handle aat environment', () => {
      getEnvironmentStub.returns('aat');
      delete require.cache[require.resolve('./ui')];
      const { uiConfig } = require('./ui');
      const config = uiConfig();
      expect(config.configEnv).to.equal('aat');
    });

    it('should handle complex service configuration', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config.services).to.have.property('prd');
      expect(config.services.prd).to.be.an('object');
      expect(config.services.prd).to.have.all.keys(['commondataApi']);
      expect(config.services.prd.commondataApi).to.equal('https://prd-common.example.com');
      expect(typeof config.services.prd.commondataApi).to.equal('string');
    });

    it('should preserve the structure for type safety', () => {
      const { uiConfig } = require('./ui');
      const config = uiConfig();

      expect(config).to.have.all.keys([
        'configEnv', 'cookies', 'exceptionOptions', 'health', 'idamClient',
        'indexUrl', 'iss', 'logging', 'maxLogLine', 'microservice', 'now',
        'oauthCallbackUrl', 'oidcEnabled', 'protocol', 'secureCookie',
        'services', 'sessionSecret', 'launchDarklyClientId'
      ]);
    });
  });
});
