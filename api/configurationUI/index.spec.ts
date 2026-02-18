import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';
import {
  COOKIE_ROLES,
  COOKIE_TOKEN,
  COOKIES_USERID,
  FEATURE_OIDC_ENABLED,
  IDAM_CLIENT,
  INDEX_URL,
  LAUNCH_DARKLY_CLIENT_ID,
  MICROSERVICE,
  NOW,
  OAUTH_CALLBACK_URL,
  PROTOCOL,
  SERVICES_IDAM_WEB
} from '../configuration/references';

describe('configurationUI/index', () => {
  let configurationUIRoute;
  let router;
  let mockRequest: any;
  let mockResponse: any;
  let mockLogger: any;
  let getConfigValueStub: sinon.SinonStub;
  let getEnvironmentStub: sinon.SinonStub;
  let showFeatureStub: sinon.SinonStub;

  const expectedUiConfig = {
    configEnv: 'preview',
    cookies: {
      roles: 'roles',
      token: '__auth__',
      userId: '__userid__'
    },
    indexUrl: '/',
    launchDarklyClientId: 'launch-darkly-client-id',
    microservice: 'xui_webapp',
    now: false,
    oidcEnabled: true,
    oauthCallbackUrl: '/oauth2/callback',
    protocol: 'https',
    idamClient: 'xuiaowebapp',
    services: {
      idamWeb: 'https://idam-web-public.aat.platform.hmcts.net'
    }
  };

  beforeEach(() => {
    mockRequest = {
      session: {},
      csrfToken: sinon.stub().returns('test-csrf-token')
    };

    mockResponse = {
      cookie: sinon.stub(),
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
      end: sinon.stub()
    };

    mockLogger = createMockLogger();

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);

    const configuration = require('../configuration');
    getConfigValueStub = sinon.stub(configuration, 'getConfigValue');
    getEnvironmentStub = sinon.stub(configuration, 'getEnvironment').returns('preview');
    showFeatureStub = sinon.stub(configuration, 'showFeature').withArgs(FEATURE_OIDC_ENABLED).returns(true);

    getConfigValueStub.withArgs(COOKIE_ROLES).returns(expectedUiConfig.cookies.roles);
    getConfigValueStub.withArgs(COOKIE_TOKEN).returns(expectedUiConfig.cookies.token);
    getConfigValueStub.withArgs(COOKIES_USERID).returns(expectedUiConfig.cookies.userId);
    getConfigValueStub.withArgs(IDAM_CLIENT).returns(expectedUiConfig.idamClient);
    getConfigValueStub.withArgs(INDEX_URL).returns(expectedUiConfig.indexUrl);
    getConfigValueStub.withArgs(LAUNCH_DARKLY_CLIENT_ID).returns(expectedUiConfig.launchDarklyClientId);
    getConfigValueStub.withArgs(MICROSERVICE).returns(expectedUiConfig.microservice);
    getConfigValueStub.withArgs(NOW).returns(expectedUiConfig.now);
    getConfigValueStub.withArgs(OAUTH_CALLBACK_URL).returns(expectedUiConfig.oauthCallbackUrl);
    getConfigValueStub.withArgs(PROTOCOL).returns(expectedUiConfig.protocol);
    getConfigValueStub.withArgs(SERVICES_IDAM_WEB).returns(expectedUiConfig.services.idamWeb);

    delete require.cache[require.resolve('./index')];
    const module = require('./index');
    router = module.router;
    configurationUIRoute = module.configurationUIRoute;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should handle new session and set CSRF token', (done) => {
    mockRequest.session = { id: 'test-session-id' };
    mockRequest.session.save = sinon.stub().callsArgWith(0);

    configurationUIRoute(mockRequest, mockResponse);

    setTimeout(() => {
      expect(mockRequest.session.env).to.be.true;
      expect(mockRequest.session.save).to.have.been.calledOnce;

      expect(mockRequest.csrfToken).to.have.been.calledOnce;
      expect(mockResponse.cookie).to.have.been.calledWith('XSRF-TOKEN', 'test-csrf-token');
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith(expectedUiConfig);
      expect(mockResponse.end).to.have.been.calledOnce;

      expect(getEnvironmentStub).to.have.been.calledOnce;
      expect(showFeatureStub).to.have.been.calledWith(FEATURE_OIDC_ENABLED);

      done();
    }, 10);
  });

  it('should handle existing session without CSRF setup', () => {
    mockRequest.session = {
      id: 'existing-session-id',
      env: true,
      save: sinon.stub()
    };

    configurationUIRoute(mockRequest, mockResponse);

    expect(mockLogger.info).to.have.been.calledWith('existing session ', 'existing-session-id');
    expect(mockRequest.session.save).to.not.have.been.called;
    expect(mockRequest.csrfToken).to.not.have.been.called;
    expect(mockResponse.cookie).to.not.have.been.called;
    expect(mockResponse.status).to.have.been.calledWith(200);
    expect(mockResponse.send).to.have.been.calledWith(expectedUiConfig);
  });

  it('should expose one GET route at / with csrf middleware and route handler', () => {
    expect(router.stack).to.have.length(1);

    const routeLayer = router.stack[0];
    expect(routeLayer.route.path).to.equal('/');
    expect(routeLayer.route.methods.get).to.be.true;
    expect(routeLayer.route.stack).to.have.length(2);
    expect(routeLayer.route.stack[0].handle).to.be.a('function');
    expect(routeLayer.route.stack[1].handle).to.equal(configurationUIRoute);
  });
});
