import { expect } from '../test/shared/testSetup';
import 'mocha';
import { ERROR_NODE_CONFIG_ENV, HTTP, DEVELOPMENT } from './constants';

describe('configuration/constants', () => {
  describe('ERROR_NODE_CONFIG_ENV', () => {
    it('should contain NODE_CONFIG_ENV error message', () => {
      const expectedMessage = `Error: NODE_CONFIG_ENV is not set. Please make sure you have the NODE_CONFIG_ENV
  setup in your environmental variables.`;
      
      expect(ERROR_NODE_CONFIG_ENV).to.equal(expectedMessage);
    });
  });

  describe('HTTP constant', () => {
    it('should be set to "http"', () => {
      expect(HTTP).to.equal('http');
    });
  });

  describe('DEVELOPMENT constant', () => {
    it('should be set to "development"', () => {
      expect(DEVELOPMENT).to.equal('development');
    });
  });
});