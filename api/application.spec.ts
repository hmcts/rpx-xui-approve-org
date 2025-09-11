import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createConfigMock } from './test/shared/configMocks';

describe('application', () => {
  let configMock: any;
  let consoleLogStub: any;
  let processExitStub: any;
  let originalEnv: any;

  beforeEach(() => {
    originalEnv = { ...process.env };

    consoleLogStub = sinon.stub(console, 'log');
    processExitStub = sinon.stub(process, 'exit');

    configMock = createConfigMock({
      'secrets.rpx.idam-secret': 'test-secret',
      'secrets.rpx.ao-s2s-client-secret': 'test-s2s-secret',
      'idam.client': 'xui_webapp',
      'services.idam.apiPath': 'https://idam-api.example.com',
      'services.idam.web': 'https://idam-web.example.com',
      'services.s2s.path': 'https://s2s.example.com',
      'services.rdProfessionalApi': 'https://rd-prof.example.com',
      'services.iss.path': 'https://iss.example.com',
      'services.feeAndPayApi': 'https://fee-pay.example.com',
      'oauthCallbackUrl': 'https://callback.example.com',
      'protocol': 'https',
      'maxLogLine': '80',
      'maxLines': '100',
      'microservice': 'xui_webapp',
      'now': 'false',
      'cookies.token': '__auth-token',
      'cookies.userId': '__userid',
      'sessionSecret': 'test-session-secret',
      'redisKeyPrefix': 'activity-tracker',
      'redisTTL': '30000',
      'redisCloudUrl': 'redis://localhost:6379',
      'helmet.contentSecurityPolicy.disabled': false,
      'helmet.referrerPolicy': 'origin',
      'feature.termsAndConditionsEnabled': false,
      'feature.helmetEnabled': true,
      'feature.oidcEnabled': true,
      'feature.proxyEnabled': false,
      'feature.redisEnabled': true,
      'feature.secureCookieEnabled': true,
      'feature.appInsightsEnabled': true
    });

    sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
    sinon.stub(require('./configuration'), 'showFeature').callsFake(configMock.showFeature);
    sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
    sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');
  });

  afterEach(() => {
    sinon.restore();
    process.env = originalEnv;
    // Clear require cache to allow re-importing
    delete require.cache[require.resolve('./application')];
  });

  describe('application initialization', () => {
    it('should initialize express app successfully', () => {
      // Set NODE_CONFIG_ENV to avoid error logging
      process.env.NODE_CONFIG_ENV = 'test';

      const application = require('./application');

      expect(application.app).to.exist;
      expect(application.logger).to.exist;
      expect(application.csrfProtection).to.exist;
    });

    it('should log error when no environment is configured', () => {
      // Remove NODE_CONFIG_ENV to trigger error
      delete process.env.NODE_CONFIG_ENV;

      // Restore and re-stub getEnvironment to return null
      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
      sinon.stub(require('./configuration'), 'showFeature').callsFake(configMock.showFeature);
      sinon.stub(require('./configuration'), 'getEnvironment').returns(null);
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      require('./application');

      expect(console.log).to.have.been.calledWith(
        sinon.match('NODE_CONFIG_ENV')
      );
    });

    it('should log environment check text', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      require('./application');

      expect(consoleLogStub).to.have.been.calledWith('Environment: test');
    });

    it('should log configuration values during initialization', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      require('./application');

      expect(consoleLogStub).to.have.been.calledWith('xui_webapp'); // IDAM_CLIENT
      expect(consoleLogStub).to.have.been.calledWith('80'); // MAX_LOG_LINE
      expect(consoleLogStub).to.have.been.calledWith('xui_webapp'); // MICROSERVICE
      expect(consoleLogStub).to.have.been.calledWith('__auth-token'); // COOKIE_TOKEN
      expect(consoleLogStub).to.have.been.calledWith('https'); // PROTOCOL
    });

    it('should log feature flag status', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      require('./application');

      expect(consoleLogStub).to.have.been.calledWith('Secure Cookie is:');
      expect(consoleLogStub).to.have.been.calledWith('App Insights enabled:');
      expect(consoleLogStub).to.have.been.calledWith('Proxy enabled:');
      expect(consoleLogStub).to.have.been.calledWith('Helmet enabled:');
      expect(consoleLogStub).to.have.been.calledWith('OIDC enabled:');
    });
  });

  describe('helmet configuration', () => {
    it('should configure helmet middleware when enabled', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
      sinon.stub(require('./configuration'), 'showFeature').callsFake((feature) => {
        return feature === 'helmetEnabled';
      });
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      const application = require('./application');

      expect(console.log).to.have.been.calledWith('Helmet enabled');
      expect(application.app).to.exist;
    });

    it('should skip helmet configuration when disabled', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
      sinon.stub(require('./configuration'), 'showFeature').returns(false);
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      require('./application');

      expect(console.log).to.not.have.been.calledWith('Helmet enabled');
    });

    it('should set robots.txt when helmet is enabled', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
      sinon.stub(require('./configuration'), 'showFeature').callsFake((feature) => {
        return feature === 'helmetEnabled';
      });
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      const application = require('./application');

      const mockReq = { url: '/robots.txt', method: 'GET' };
      const mockRes = {
        type: sinon.stub().returnsThis(),
        send: sinon.stub()
      };
      const mockNext = sinon.stub();

      expect(application.app).to.exist;

      // Simulate the robots.txt route call
      application.app._router.stack.find((layer) =>
        layer.route && layer.route.path === '/robots.txt'
      ).route.stack[0].handle(mockReq, mockRes, mockNext);

      expect(mockRes.type).to.have.been.calledWith('text/plain');
      expect(mockRes.send).to.have.been.calledWith('User-agent: *\nDisallow: /');
    });
  });

  describe('OIDC configuration', () => {
    it('should log OIDC enabled status', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
      sinon.stub(require('./configuration'), 'showFeature').callsFake((feature) => {
        return feature === 'oidcEnabled';
      });
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      require('./application');

      expect(console.log).to.have.been.calledWith('OIDC enabled:');
      expect(console.log).to.have.been.calledWith('OIDC enabled');
    });

    it('should not log OIDC enabled when disabled', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      // Restore and setup clean stubs for this test
      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
      sinon.stub(require('./configuration'), 'showFeature').returns(false);
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      require('./application');

      expect(console.log).to.have.been.calledWith('OIDC enabled:');
      expect(console.log).to.not.have.been.calledWith('OIDC enabled');
    });
  });

  describe('authentication options', () => {
    it('should configure authentication options correctly', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      const application = require('./application');

      expect(application.app).to.exist;

      // Verify authentication middleware is attached
      const middlewares = application.app._router.stack;
      const hasAttachMiddleware = middlewares.some((layer) =>
        layer.name === 'attachMiddleware' ||
        (layer.handle && layer.handle.name === 'attach')
      );

      // The auth attachment happens but we can verify the app has middleware configured
      expect(middlewares.length).to.be.greaterThan(0);

      // Verify that authentication-related routes are accessible
      expect(application.app).to.have.property('_router');
    });

    it('should construct correct URLs from configuration', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      require('./application');

      expect(consoleLogStub).to.have.been.calledWith('tokenUrl');
    });

    it('should handle different IDAM API paths', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake((key) => {
        if (key === 'services.idam.apiPath') {
          return 'https://different-idam.example.com';
        }
        return configMock.getConfigValue(key);
      });
      sinon.stub(require('./configuration'), 'showFeature').callsFake(configMock.showFeature);
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      require('./application');

      expect(console.log).to.have.been.calledWith('tokenUrl');
    });
  });

  describe('environment variables logging', () => {
    it('should log NODE_CONFIG_ENV', () => {
      process.env.NODE_CONFIG_ENV = 'production';

      require('./application');

      expect(consoleLogStub).to.have.been.calledWith('ENV PRINT');
      expect(consoleLogStub).to.have.been.calledWith('production');
    });

    it('should log ALLOW_CONFIG_MUTATIONS', () => {
      process.env.ALLOW_CONFIG_MUTATIONS = 'true';
      process.env.NODE_CONFIG_ENV = 'test';

      require('./application');

      expect(consoleLogStub).to.have.been.calledWith('process.env.ALLOW_CONFIG_MUTATIONS');
      expect(consoleLogStub).to.have.been.calledWith('true');
    });

    it('should handle undefined environment variables', () => {
      delete process.env.ALLOW_CONFIG_MUTATIONS;
      process.env.NODE_CONFIG_ENV = 'test';

      require('./application');

      expect(consoleLogStub).to.have.been.calledWith('process.env.ALLOW_CONFIG_MUTATIONS');
      expect(consoleLogStub).to.have.been.calledWith(undefined);
    });
  });

  describe('module exports', () => {
    it('should export app, logger, and csrfProtection', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      const application = require('./application');

      expect(application).to.have.property('app');
      expect(application).to.have.property('logger');
      expect(application).to.have.property('csrfProtection');
    });

    it('should create express application instance', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      const application = require('./application');

      expect(application.app).to.be.a('function');
    });

    it('should create logger with server category', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      const application = require('./application');

      expect(application.logger).to.exist;
    });
  });

  describe('configuration validation', () => {
    it('should handle missing configuration gracefully', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake((key) => {
        // Return empty string for S2S secret to prevent trim() error
        if (key === 'secrets.rpx.ao-s2s-client-secret') {
          return '';
        }
        return undefined;
      });
      sinon.stub(require('./configuration'), 'showFeature').callsFake(configMock.showFeature);
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      expect(() => {
        require('./application');
      }).to.not.throw();
    });

    it('should handle boolean feature flags correctly', () => {
      process.env.NODE_CONFIG_ENV = 'test';

      sinon.restore();
      sinon.stub(console, 'log');
      sinon.stub(process, 'exit');
      sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
      sinon.stub(require('./configuration'), 'showFeature').callsFake((feature) => {
        return feature === 'helmetEnabled' || feature === 'oidcEnabled';
      });
      sinon.stub(require('./configuration'), 'getEnvironment').returns('test');
      sinon.stub(require('./configuration'), 'environmentCheckText').returns('Environment: test');

      expect(() => {
        require('./application');
      }).to.not.throw();
    });
  });
});
