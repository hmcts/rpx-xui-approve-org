import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockEnhancedRequest, createMockResponse } from './test/shared/authMocks';

describe('health', () => {
  let configStub: any;
  let showFeatureStub: any;
  let mockRequest: any;
  let mockResponse: any;
  let processEnvStub: any;

  beforeEach(() => {
    configStub = sinon.stub();
    showFeatureStub = sinon.stub();

    // Mock configuration values to return undefined for keys that don't exist
    configStub.returns(undefined);

    showFeatureStub.withArgs('secureCookieEnabled').returns(true);
    showFeatureStub.withArgs('appInsightsEnabled').returns(false);
    showFeatureStub.withArgs('proxyEnabled').returns(true);

    mockRequest = createMockEnhancedRequest();
    mockResponse = createMockResponse();

    processEnvStub = {
      ALLOW_CONFIG_MUTATIONS: 'false',
      NODE_CONFIG_ENV: 'development'
    };
    sinon.stub(process, 'env').value(processEnvStub);

    sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configStub);
    sinon.stub(require('./configuration'), 'showFeature').callsFake(showFeatureStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('health router', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./health')];
      const module = require('./health');
      router = module.default;
    });

    it('should return health/configuration information', () => {
      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledOnce;
      expect(mockResponse.status).to.have.been.calledWith(200);

      const expectedResponse = {
        allowConfigMutations: 'false',
        nodeConfigEnv: 'development',
        idamClient: undefined,
        maxLogLine: undefined,
        microService: undefined,
        maxLines: undefined,
        now: undefined,
        cookieToken: undefined,
        cookieUserId: undefined,
        oauthCallBack: undefined,
        protocol: undefined,
        idamApiPath: undefined,
        idamWeb: undefined,
        s2sPath: undefined,
        rdProfessionalApi: undefined,
        feeAndPayApi: undefined,
        sessionSecret: undefined,
        featureSecureCookieEnabled: true,
        featureAppInsightEnabled: false,
        featureProxyEnabled: true
      };

      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith(expectedResponse);
    });

    it('should handle different environment values', () => {
      processEnvStub.ALLOW_CONFIG_MUTATIONS = 'true';
      processEnvStub.NODE_CONFIG_ENV = 'production';

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      const expectedResponse = {
        allowConfigMutations: 'true',
        nodeConfigEnv: 'production',
        idamClient: undefined,
        maxLogLine: undefined,
        microService: undefined,
        maxLines: undefined,
        now: undefined,
        cookieToken: undefined,
        cookieUserId: undefined,
        oauthCallBack: undefined,
        protocol: undefined,
        idamApiPath: undefined,
        idamWeb: undefined,
        s2sPath: undefined,
        rdProfessionalApi: undefined,
        feeAndPayApi: undefined,
        sessionSecret: undefined,
        featureSecureCookieEnabled: true,
        featureAppInsightEnabled: false,
        featureProxyEnabled: true
      };

      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith(expectedResponse);
    });

    it('should handle undefined environment values', () => {
      delete processEnvStub.ALLOW_CONFIG_MUTATIONS;
      delete processEnvStub.NODE_CONFIG_ENV;

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      const expectedResponse = {
        allowConfigMutations: undefined,
        nodeConfigEnv: undefined,
        idamClient: undefined,
        maxLogLine: undefined,
        microService: undefined,
        maxLines: undefined,
        now: undefined,
        cookieToken: undefined,
        cookieUserId: undefined,
        oauthCallBack: undefined,
        protocol: undefined,
        idamApiPath: undefined,
        idamWeb: undefined,
        s2sPath: undefined,
        rdProfessionalApi: undefined,
        feeAndPayApi: undefined,
        sessionSecret: undefined,
        featureSecureCookieEnabled: true,
        featureAppInsightEnabled: false,
        featureProxyEnabled: true
      };

      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith(expectedResponse);
    });

    it('should call configuration and feature functions with correct arguments', () => {
      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      // Verify configuration functions were called with specific arguments
      expect(configStub).to.have.callCount(15);
      expect(configStub).to.have.been.calledWith('idamClient');
      expect(configStub).to.have.been.calledWith('maxLogLine');
      expect(configStub).to.have.been.calledWith('microservice');
      expect(configStub).to.have.been.calledWith('exceptionOptions.maxLines');
      expect(configStub).to.have.been.calledWith('now');
      expect(configStub).to.have.been.calledWith('cookies.token');
      expect(configStub).to.have.been.calledWith('cookies.userId');
      expect(configStub).to.have.been.calledWith('oauthCallbackUrl');
      expect(configStub).to.have.been.calledWith('protocol');
      expect(configStub).to.have.been.calledWith('services.idamApi');
      expect(configStub).to.have.been.calledWith('services.idamWeb');
      expect(configStub).to.have.been.calledWith('services.s2s');
      expect(configStub).to.have.been.calledWith('services.rdProfessionalApi');
      expect(configStub).to.have.been.calledWith('services.feeAndPayApi');
      expect(configStub).to.have.been.calledWith('secrets.rpx.ao-session-secret');

      expect(showFeatureStub).to.have.callCount(3);
      expect(showFeatureStub).to.have.been.calledWith('secureCookieEnabled');
      expect(showFeatureStub).to.have.been.calledWith('appInsightsEnabled');
      expect(showFeatureStub).to.have.been.calledWith('proxyEnabled');

      expect(mockResponse.status).to.have.been.calledOnce;
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledOnce;
    });

    it('should return configuration values when they are defined', () => {
      configStub.withArgs('idamClient').returns('test-idam-client');
      configStub.withArgs('microservice').returns('xui-approve-org');
      configStub.withArgs('protocol').returns('https');

      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      const expectedResponse = {
        allowConfigMutations: 'false',
        nodeConfigEnv: 'development',
        idamClient: 'test-idam-client',
        maxLogLine: undefined,
        microService: 'xui-approve-org',
        maxLines: undefined,
        now: undefined,
        cookieToken: undefined,
        cookieUserId: undefined,
        oauthCallBack: undefined,
        protocol: 'https',
        idamApiPath: undefined,
        idamWeb: undefined,
        s2sPath: undefined,
        rdProfessionalApi: undefined,
        feeAndPayApi: undefined,
        sessionSecret: undefined,
        featureSecureCookieEnabled: true,
        featureAppInsightEnabled: false,
        featureProxyEnabled: true
      };

      expect(mockResponse.status).to.have.been.calledOnce;
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledOnce;
      expect(mockResponse.send).to.have.been.calledWith(expectedResponse);
    });
  });

  describe('module exports', () => {
    it('should export router as default', () => {
      const module = require('./health');
      expect(module.default).to.exist;
      expect(module.default).to.be.a('function');
      expect(module.default.stack).to.be.an('array');
      expect(module.default.stack).to.have.lengthOf(1);
    });

    it('should have GET route configured for /', () => {
      const module = require('./health');
      const router = module.default;

      expect(router.stack).to.be.an('array');
      expect(router.stack).to.have.lengthOf(1);

      const route = router.stack[0].route;
      expect(route.path).to.equal('/');
      expect(route.methods.get).to.be.true;
      expect(route.methods.post).to.be.undefined;
      expect(route.methods.put).to.be.undefined;
      expect(route.methods.delete).to.be.undefined;
      expect(route.stack).to.have.lengthOf(1);
      expect(route.stack[0].handle).to.be.a('function');
    });
  });
});
