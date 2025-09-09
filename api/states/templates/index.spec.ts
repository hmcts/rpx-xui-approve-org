import { expect } from '../../test/shared/testSetup';
import 'mocha';

describe('states/templates/index', () => {
  let templates: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./index')];
    const module = require('./index');
    templates = module.default;
  });

  describe('templates object', () => {
    it('should export templates with any property', () => {
      expect(templates).to.exist;
      expect(templates.any).to.be.an('object');
    });

    it('should include email-address template', () => {
      expect(templates.any).to.have.property('email-address');
      expect(templates.any['email-address']).to.exist;
    });

    it('should include name template', () => {
      expect(templates.any).to.have.property('name');
      expect(templates.any.name).to.exist;
    });

    it('should include organisation-address template', () => {
      expect(templates.any).to.have.property('organisation-address');
      expect(templates.any['organisation-address']).to.exist;
    });

    it('should include organisation-dx template', () => {
      expect(templates.any).to.have.property('organisation-dx');
      expect(templates.any['organisation-dx']).to.exist;
    });

    it('should include organisation-have-dx template', () => {
      expect(templates.any).to.have.property('organisation-have-dx');
      expect(templates.any['organisation-have-dx']).to.exist;
    });

    it('should include organisation-name template', () => {
      expect(templates.any).to.have.property('organisation-name');
      expect(templates.any['organisation-name']).to.exist;
    });

    it('should include organisation-pba template', () => {
      expect(templates.any).to.have.property('organisation-pba');
      expect(templates.any['organisation-pba']).to.exist;
    });

    it('should have all expected template keys', () => {
      const expectedKeys = [
        'email-address',
        'name',
        'organisation-address',
        'organisation-dx',
        'organisation-have-dx',
        'organisation-name',
        'organisation-pba'
      ];

      const actualKeys = Object.keys(templates.any);
      expect(actualKeys).to.have.length(expectedKeys.length);
      expectedKeys.forEach((key) => {
        expect(actualKeys).to.include(key);
      });
    });

    it('should be an array with any property', () => {
      expect(Array.isArray(templates)).to.be.true;
      expect(templates.any).to.be.an('object');
    });
  });
});
