import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createConfigMock } from './test/shared/configMocks';

describe('server', () => {
  let appMock: any;
  let loggerMock: any;
  let ejsMock: any;
  let expressMock: any;
  let pathMock: any;
  let idamCheckStub: sinon.SinonStub;
  let processEnvStub: any;
  let processExitStub: sinon.SinonStub;
  let consoleTimeStub: any;
  let consoleTimeEndStub: any;
  let consoleLogStub: any;
  let configMock: any;
  const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

  beforeEach(() => {
    delete require.cache[require.resolve('./application')];
    delete require.cache[require.resolve('./server')];
    delete require.cache[require.resolve('./configuration')];

    configMock = createConfigMock({
      'secrets.rpx.ao-idam-client-secret': 'test-idam-secret',
      'secrets.rpx.ao-s2s-client-secret': 'test-s2s-secret',
      'idamClient': 'xui_webapp',
      'services.idamWeb': 'http://localhost:3501',
      'services.iss': 'http://localhost:5000/auth/realms/hmcts',
      'services.idam.api.path': 'http://localhost:5000'
    });
    sinon.stub(require('./configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
    sinon.stub(require('./configuration'), 'showFeature').callsFake(configMock.showFeature);
    appMock = {
      engine: sinon.stub(),
      set: sinon.stub(),
      use: sinon.stub(),
      listen: sinon.stub()
    };

    loggerMock = {
      info: sinon.stub(),
      error: sinon.stub()
    };

    ejsMock = {
      renderFile: sinon.stub()
    };

    expressMock = {
      static: sinon.stub().returns('static-middleware')
    };

    pathMock = {
      join: sinon.stub().callsFake((...args) => args.join('/'))
    };

    consoleTimeStub = sinon.stub(console, 'time');
    consoleTimeEndStub = sinon.stub(console, 'timeEnd');
    consoleLogStub = sinon.stub(console, 'log');
    processExitStub = sinon.stub(process, 'exit');

    processEnvStub = sinon.stub(process, 'env').value({ PORT: undefined });

    sinon.stub(require('./application'), 'app').value(appMock);
    sinon.stub(require('./application'), 'logger').value(loggerMock);
    idamCheckStub = sinon.stub().callsFake((resolve: any) => resolve());
    sinon.stub(require('./idamCheck'), 'idamCheck').callsFake(idamCheckStub);
    sinon.stub(require('ejs'), 'renderFile').value(ejsMock.renderFile);
    sinon.stub(require('express'), 'static').callsFake(expressMock.static);
    sinon.stub(require('path'), 'join').callsFake(pathMock.join);
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve('./server')];
  });

  describe('server initialization', () => {
    it('should configure EJS as template engine', () => {
      require('./server');

      expect(appMock.engine).to.have.been.calledWith('html', ejsMock.renderFile);
      expect(appMock.set).to.have.been.calledWith('view engine', 'html');
      expect(appMock.set).to.have.been.calledWith('views', __dirname);
    });

    it('should configure static file serving', () => {
      require('./server');

      expect(expressMock.static).to.have.been.calledTwice;
      expect(appMock.use).to.have.been.calledWith('static-middleware');
      expect(pathMock.join).to.have.been.calledWith(sinon.match.string, '..', 'assets');
      expect(pathMock.join).to.have.been.calledWith(sinon.match.string, '..');
    });

    it('should configure catch-all route handler', () => {
      require('./server');

      expect(appMock.use).to.have.been.calledWith('/*');
      expect(appMock.use.args.find((call) => call[0] === '/*')).to.exist;
    });

    it('should start server on default port 3000', async () => {
      require('./server');
      await flushPromises();

      expect(appMock.listen).to.have.been.calledWith(3000);
    });

    it('should start server on PORT environment variable when set', async () => {
      processEnvStub.value({ PORT: '8080' });

      require('./server');
      await flushPromises();

      expect(appMock.listen).to.have.been.calledWith('8080');
    });

    it('should log server startup message', async () => {
      // Mock the callback from app.listen
      appMock.listen.callsArg(1);

      require('./server');
      await flushPromises();

      expect(loggerMock.info).to.have.been.calledWith('Local server up at 3000');
    });

    it('should log initialization message', () => {
      require('./server');

      expect(consoleLogStub).to.have.been.calledWith('WE ARE USING server.ts on the box.');
    });

    it('should wait for idam check before listening', async () => {
      require('./server');
      await flushPromises();

      expect(idamCheckStub).to.have.been.calledOnce;
      expect(appMock.listen).to.have.been.calledOnce;
    });

    it('should exit when idam check fails', async () => {
      const error = new Error('idam down');
      idamCheckStub.callsFake((_resolve: any, reject: any) => reject(error));

      require('./server');
      await flushPromises();

      expect(loggerMock.error).to.have.been.calledWith('idam check failed after retries', error);
      expect(processExitStub).to.have.been.calledWith(1);
      expect(appMock.listen).not.to.have.been.called;
    });
  });

  describe('catch-all route handler', () => {
    let routeHandler: any;
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
      require('./server');

      // Find the catch-all route handler
      const catchAllCall = appMock.use.args.find((call) => call[0] === '/*');
      routeHandler = catchAllCall[1];

      mockReq = {
        originalUrl: '/test/path'
      };

      mockRes = {
        render: sinon.stub()
      };
    });

    it('should time the request processing', () => {
      routeHandler(mockReq, mockRes);

      expect(consoleTimeStub).to.have.been.calledWith('GET: /test/path');
      expect(consoleTimeEndStub).to.have.been.calledWith('GET: /test/path');
    });

    it('should render index template with providers', () => {
      routeHandler(mockReq, mockRes);

      expect(mockRes.render).to.have.been.calledWith('../index', {
        providers: [
          { provide: 'REQUEST', useValue: mockReq },
          { provide: 'RESPONSE', useValue: mockRes }
        ],
        req: mockReq,
        res: mockRes
      });
    });

    it('should handle different URLs correctly', () => {
      mockReq.originalUrl = '/organizations/123';

      routeHandler(mockReq, mockRes);

      expect(consoleTimeStub).to.have.been.calledWith('GET: /organizations/123');
      expect(consoleTimeEndStub).to.have.been.calledWith('GET: /organizations/123');
    });
  });

  describe('path configuration', () => {
    it('should configure assets path correctly', () => {
      require('./server');

      expect(pathMock.join).to.have.been.calledWith(sinon.match.string, '..', 'assets');
    });

    it('should configure root path correctly', () => {
      require('./server');

      expect(pathMock.join).to.have.been.calledWith(sinon.match.string, '..');
    });
  });
});
