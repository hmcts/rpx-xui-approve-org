import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import * as log4js from 'log4js';
import { getLogger } from './log4jui';
import { createConfigMock, mockAppInsights } from '../test/shared/configMocks';

describe('log4jui', () => {
  let mockLog4js: any;
  let configMock: any;
  let appInsightsStub: any;

  beforeEach(() => {
    mockLog4js = {
      getLogger: sinon.stub().returns({
        level: '',
        debug: sinon.stub(),
        info: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub()
      })
    };

    configMock = createConfigMock({
      'logging': 'info'
    });

    appInsightsStub = {
      trackRequest: sinon.stub(),
      trackException: sinon.stub(),
      trackTrace: sinon.stub()
    };

    sinon.stub(require('log4js'), 'getLogger').callsFake(mockLog4js.getLogger);
    configMock.getConfigValueStub = sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
    sinon.stub(require('./appInsights'), 'client').value(appInsightsStub);
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve('./log4jui')];
    delete require.cache[require.resolve('../configuration')];
    delete require.cache[require.resolve('./appInsights')];
  });

  describe('getLogger', () => {
    it('should create a logger with the correct category', () => {
      const logger = getLogger('test-category');

      expect(mockLog4js.getLogger).to.have.been.calledWith('test-category');
      expect(logger).to.have.property('debug');
      expect(logger).to.have.property('info');
      expect(logger).to.have.property('warn');
      expect(logger).to.have.property('error');
      expect(logger).to.have.property('trackRequest');
    });

    it('should set the logger level from configuration', () => {
      configMock.getConfigValueStub.restore();
      delete require.cache[require.resolve('./log4jui')];

      const freshConfigStub = sinon.stub(require('../configuration'), 'getConfigValue');
      freshConfigStub.withArgs('logging').returns('info');

      const { getLogger: freshGetLogger } = require('./log4jui');
      const logger = freshGetLogger('test-category');

      expect(freshConfigStub).to.have.been.calledWith('logging');
      expect(logger._logger.level).to.equal('info');
    });

    it('should default to "off" when no logging configuration is provided', () => {
      sinon.restore();
      delete require.cache[require.resolve('./log4jui')];

      sinon.stub(require('log4js'), 'getLogger').callsFake(mockLog4js.getLogger);
      sinon.stub(require('./appInsights'), 'client').value(appInsightsStub);

      const freshConfigStub = sinon.stub(require('../configuration'), 'getConfigValue');
      freshConfigStub.withArgs('logging').returns(undefined);

      const { getLogger: freshGetLogger } = require('./log4jui');
      const logger = freshGetLogger('test-category');

      expect(logger._logger.level).to.equal('off');
    });

    describe('logger methods', () => {
      let logger: any;
      let mockInternalLogger: any;

      beforeEach(() => {
        mockInternalLogger = {
          level: 'info',
          debug: sinon.stub(),
          info: sinon.stub(),
          warn: sinon.stub(),
          error: sinon.stub()
        };
        mockLog4js.getLogger.returns(mockInternalLogger);
        logger = getLogger('test');
      });

      it('should call debug on internal logger', () => {
        logger.debug('debug message');
        expect(mockInternalLogger.debug).to.have.been.calledWith('debug message');
      });

      it('should call info on internal logger', () => {
        logger.info('info message');
        expect(mockInternalLogger.info).to.have.been.calledWith('info message');
      });

      it('should call warn on internal logger', () => {
        logger.warn('warn message');
        expect(mockInternalLogger.warn).to.have.been.calledWith('warn message');
      });

      it('should call error on internal logger', () => {
        logger.error('error message');
        expect(mockInternalLogger.error).to.have.been.calledWith('error message');
      });

      it('should track request when appInsights client is available', () => {
        delete require.cache[require.resolve('./log4jui')];
        sinon.stub(require('./appInsights'), 'client').value(appInsightsStub);
        const { getLogger } = require('./log4jui');
        const freshLogger = getLogger('test');

        const requestData = { name: 'test-request', duration: 100 };

        freshLogger.trackRequest(requestData);

        expect(appInsightsStub.trackRequest).to.have.been.calledWith(requestData);
      });

      it('should not throw when appInsights client is not available', () => {
        sinon.stub(require('./appInsights'), 'client').value(null);

        const requestData = { name: 'test-request', duration: 100 };

        expect(() => logger.trackRequest(requestData)).to.not.throw();
      });
    });
  });
});
