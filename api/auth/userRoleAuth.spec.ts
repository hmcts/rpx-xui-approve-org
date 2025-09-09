import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('auth/userRoleAuth', () => {
  let consoleLogStub: any;

  beforeEach(() => {
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('havePrdAdminRole function', () => {
    let havePrdAdminRole: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./userRoleAuth')];
      const module = require('./userRoleAuth');
      havePrdAdminRole = module.havePrdAdminRole;
    });

    it('should return true when userData contains prd-admin role', () => {
      const userData = ['user', 'prd-admin', 'other-role'];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.true;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', sinon.match.number);
    });

    it('should return false when userData does not contain prd-admin role', () => {
      const userData = ['user', 'other-role', 'different-role'];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.false;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', -1);
    });

    it('should return true when prd-admin is at the beginning of the array', () => {
      const userData = ['prd-admin', 'user', 'other-role'];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.true;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', 0);
    });

    it('should return true when prd-admin is at the end of the array', () => {
      const userData = ['user', 'other-role', 'prd-admin'];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.true;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', 2);
    });

    it('should return false when userData is empty array', () => {
      const userData: string[] = [];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.false;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', -1);
    });

    it('should return true when userData contains prd-admin multiple times', () => {
      const userData = ['prd-admin', 'user', 'prd-admin'];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.true;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', 0);
    });

    it('should return false when userData contains similar but not exact role names', () => {
      const userData = ['prd-administrator', 'prd-admin-user', 'admin-prd'];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.false;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', -1);
    });

    it('should be case sensitive', () => {
      const userData = ['PRD-ADMIN', 'Prd-Admin', 'prd-Admin'];
      const result = havePrdAdminRole(userData);

      expect(result).to.be.false;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', -1);
    });

    it('should handle null input gracefully', () => {
      expect(() => havePrdAdminRole(null)).to.throw();
    });

    it('should handle undefined input gracefully', () => {
      expect(() => havePrdAdminRole(undefined)).to.throw();
    });

    it('should handle non-array input gracefully', () => {
      const result = havePrdAdminRole('not-an-array');
      
      expect(result).to.be.false;
      expect(consoleLogStub).to.have.been.calledOnce;
      expect(consoleLogStub).to.have.been.calledWith('userData', -1);
    });
  });
});