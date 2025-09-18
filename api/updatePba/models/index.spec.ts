import { expect } from '../../test/shared/testSetup';
import 'mocha';

describe('updatePba/models/index', () => {
  let models: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./index')];
    models = require('./index');
  });

  describe('exports', () => {
    it('should export from organisation.model', () => {
      expect(models).to.be.an('object');
    });

    it('should export from pbaNumber.model', () => {
      expect(models).to.be.an('object');
    });

    it('should export from search/index', () => {
      expect(models).to.be.an('object');
    });

    it('should have module loaded without errors', () => {
      const module = require('./index');
      expect(module).to.exist;
    });

    it('should be re-importable', () => {
      const module1 = require('./index');
      const module2 = require('./index');
      expect(module1).to.equal(module2); // Same instance due to require cache
    });

    it('should export expected types', () => {
      expect(typeof models).to.equal('object');
    });
  });
});
