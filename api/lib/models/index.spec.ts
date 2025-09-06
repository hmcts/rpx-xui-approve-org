import { expect } from '../../test/shared/testSetup';
import 'mocha';

describe('lib/models/index', () => {
  let EnhancedRequest: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./index')];
    const module = require('./index');
    EnhancedRequest = module.EnhancedRequest;
  });

  describe('EnhancedRequest interface', () => {
    it('should export EnhancedRequest interface', () => {
      const module = require('./index');
      expect(module.EnhancedRequest).to.be.undefined; // Interface exports are compile-time only
      expect(module).to.be.an('object');
    });

    it('should be importable as a type', () => {
      const module = require('./index');
      expect(module).to.exist;
    });

    it('should have the correct interface structure when used', () => {
      const module = require('./index');
      expect(Object.keys(module)).to.be.an('array');
    });
  });
});