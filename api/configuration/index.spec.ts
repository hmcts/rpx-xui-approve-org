import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('configuration/index', () => {
  let configStub: any;

  beforeEach(() => {
    configStub = {
      get: sinon.stub()
    };
    
    sinon.stub(require('config'), 'get').callsFake(configStub.get);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getEnvironment', () => {
    it('should return NODE_CONFIG_ENV from process.env', () => {
      process.env.NODE_CONFIG_ENV = 'development';
      
      const { getEnvironment } = require('./index');
      const result = getEnvironment();
      
      expect(result).to.equal('development');
    });

    it('should return undefined when NODE_CONFIG_ENV is not set', () => {
      delete process.env.NODE_CONFIG_ENV;
      
      delete require.cache[require.resolve('./index')];
      const { getEnvironment } = require('./index');
      const result = getEnvironment();
      
      expect(result).to.be.undefined;
    });
  });

  describe('getConfigValue', () => {
    it('should call config.get with the provided reference', () => {
      configStub.get.returns('test-value');
      
      const { getConfigValue } = require('./index');
      const result = getConfigValue('test.reference');
      
      expect(configStub.get).to.have.been.calledWith('test.reference');
      expect(result).to.equal('test-value');
    });

    it('should pass through exact config values without transformation', () => {
      const testValue = 42;
      configStub.get.returns(testValue);
      
      const { getConfigValue } = require('./index');
      const result = getConfigValue('test.passthrough');
      
      expect(configStub.get).to.have.been.calledWith('test.passthrough');
      expect(result).to.equal(testValue);
      expect(result === testValue).to.be.true;
    });

    it('should handle nested configuration paths', () => {
      configStub.get.returns('nested-value');
      
      const { getConfigValue } = require('./index');
      const result = getConfigValue('services.api.path');
      
      expect(configStub.get).to.have.been.calledWith('services.api.path');
      expect(result).to.equal('nested-value');
    });

    it('should handle string values from config', () => {
      configStub.get.returns('string-value');
      
      const { getConfigValue } = require('./index');
      const result = getConfigValue('test.string');
      
      expect(configStub.get).to.have.been.calledWith('test.string');
      expect(result).to.equal('string-value');
      expect(typeof result).to.equal('string');
    });

    it('should handle number values from config', () => {
      configStub.get.returns(42);
      
      const { getConfigValue } = require('./index');
      const result = getConfigValue('test.number');
      
      expect(configStub.get).to.have.been.calledWith('test.number');
      expect(result).to.equal(42);
      expect(typeof result).to.equal('number');
    });

    it('should handle boolean values from config', () => {
      configStub.get.returns(true);
      
      const { getConfigValue } = require('./index');
      const result = getConfigValue('test.boolean');
      
      expect(configStub.get).to.have.been.calledWith('test.boolean');
      expect(result).to.be.true;
      expect(typeof result).to.equal('boolean');
    });

    it('should handle object values from config', () => {
      const testObject = { key: 'value', nested: { prop: 123 } };
      configStub.get.returns(testObject);
      
      const { getConfigValue } = require('./index');
      const result = getConfigValue('test.object');
      
      expect(configStub.get).to.have.been.calledWith('test.object');
      expect(result).to.deep.equal(testObject);
      expect(typeof result).to.equal('object');
    });
  });

  describe('showFeature', () => {
    it('should call config.get with feature prefix', () => {
      configStub.get.returns(true);
      
      const { showFeature } = require('./index');
      const result = showFeature('MY_FEATURE');
      
      expect(configStub.get).to.have.been.calledWith('feature.MY_FEATURE');
      expect(result).to.be.true;
    });

    it('should throw if feature is not present in config', () => {
      configStub.get.throws(new Error('Feature not found'));

      const { showFeature } = require('./index');
      expect(() => showFeature('MISSING_FEATURE')).to.throw('Feature not found');
    });

    it('should return true for enabled features', () => {
      configStub.get.returns(true);
      
      const { showFeature } = require('./index');
      const result = showFeature('ENABLED_FEATURE');
      
      expect(configStub.get).to.have.been.calledOnce;
      expect(configStub.get).to.have.been.calledWith('feature.ENABLED_FEATURE');
      expect(result).to.be.true;
      expect(typeof result).to.equal('boolean');
    });

    it('should handle non-boolean config values', () => {
      configStub.get.returns('true'); // String instead of boolean
      
      const { showFeature } = require('./index');
      const result = showFeature('STRING_FEATURE');
      
      expect(configStub.get).to.have.been.calledWith('feature.STRING_FEATURE');
      expect(result).to.equal('true'); // Returns what config returns
      expect(typeof result).to.equal('string');
    });
  });

  describe('environmentCheckText', () => {
    it('should generate environment check message', () => {
      process.env.NODE_CONFIG_ENV = 'production';
      configStub.get.withArgs('environment').returns('prod');
      
      const { environmentCheckText } = require('./index');
      const result = environmentCheckText();
      
      const expectedMessage = 'NODE_CONFIG_ENV is set as production therefore we are using the prod config.';
      expect(result).to.equal(expectedMessage);
    });

    it('should handle deleted NODE_CONFIG_ENV', () => {
      delete process.env.NODE_CONFIG_ENV;
      configStub.get.withArgs('environment').returns('default');
      
      delete require.cache[require.resolve('./index')];
      const { environmentCheckText } = require('./index');
      const result = environmentCheckText();
      
      const expectedMessage = 'NODE_CONFIG_ENV is set as undefined therefore we are using the default config.';
      expect(result).to.equal(expectedMessage);
      expect(configStub.get).to.have.been.calledWith('environment');
    });

    it('should handle string "undefined" NODE_CONFIG_ENV', () => {
      process.env.NODE_CONFIG_ENV = 'undefined';
      configStub.get.withArgs('environment').returns('fallback');
      
      delete require.cache[require.resolve('./index')];
      const { environmentCheckText } = require('./index');
      const result = environmentCheckText();
      
      const expectedMessage = 'NODE_CONFIG_ENV is set as undefined therefore we are using the fallback config.';
      expect(result).to.equal(expectedMessage);
      expect(configStub.get).to.have.been.calledWith('environment');
    });
  });

  describe('getProtocol', () => {
    it('should return http for development environment', () => {
      process.env.NODE_CONFIG_ENV = 'development';
      
      delete require.cache[require.resolve('./index')];
      const { getProtocol } = require('./index');
      const result = getProtocol();
      
      expect(result).to.equal('http');
    });

    it('should return configured protocol for non-development environment', () => {
      process.env.NODE_CONFIG_ENV = 'production';
      configStub.get.withArgs('protocol').returns('https');
      
      delete require.cache[require.resolve('./index')];
      const { getProtocol } = require('./index');
      const result = getProtocol();
      
      expect(result).to.equal('https');
    });

    it('should handle deleted environment variable', () => {
      delete process.env.NODE_CONFIG_ENV;
      configStub.get.withArgs('protocol').returns('https');
      
      delete require.cache[require.resolve('./index')];
      const { getProtocol } = require('./index');
      const result = getProtocol();
      
      expect(result).to.equal('https');
      expect(configStub.get).to.have.been.calledWith('protocol');
    });

    it('should handle string "undefined" environment', () => {
      process.env.NODE_CONFIG_ENV = 'undefined';
      configStub.get.withArgs('protocol').returns('https');
      
      delete require.cache[require.resolve('./index')];
      const { getProtocol } = require('./index');
      const result = getProtocol();
      
      expect(result).to.equal('https');
      expect(configStub.get).to.have.been.calledWith('protocol');
    });

    it('should handle null environment', () => {
      process.env.NODE_CONFIG_ENV = null as any;
      configStub.get.withArgs('protocol').returns('https');
      
      delete require.cache[require.resolve('./index')];
      const { getProtocol } = require('./index');
      const result = getProtocol();
      
      expect(result).to.equal('https');
      expect(configStub.get).to.have.been.calledWith('protocol');
    });
  });
});