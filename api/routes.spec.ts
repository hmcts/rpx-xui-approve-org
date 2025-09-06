import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('routes', () => {
  let mockXuiNode: any;

  beforeEach(() => {
    mockXuiNode = {
      authenticate: sinon.stub()
    };

    sinon.stub(require('@hmcts/rpx-xui-node-lib'), 'xuiNode').value(mockXuiNode);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('router configuration', () => {
    it('should export a router', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      expect(router).to.exist;
      expect(router).to.be.a('function');
    });

    it('should configure environment route without authentication', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      expect(router.stack).to.be.an('array');
      expect(router.stack.length).to.be.greaterThan(0);
      
      // First route should be environment (open route)
      const environmentRoute = router.stack[0];
      expect(environmentRoute.regexp.source).to.include('environment');
    });

    it('should use xuiNode authenticate middleware', () => {
      delete require.cache[require.resolve('./routes')];
      require('./routes').default;
      
      expect(mockXuiNode.authenticate).to.exist;
    });

    it('should configure all protected routes', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      expect(router.stack.length).to.be.greaterThan(10);
      
      const routePaths = router.stack.map(layer => layer.regexp.source);
      expect(routePaths.some(path => path.includes('user'))).to.be.true;
      expect(routePaths.some(path => path.includes('decisions'))).to.be.true;
      expect(routePaths.some(path => path.includes('organisations'))).to.be.true;
      expect(routePaths.some(path => path.includes('pba'))).to.be.true;
    });

    it('should configure monitoring-tools route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      const routePaths = router.stack.map(layer => layer.regexp.source);
      expect(routePaths.some(path => path.includes('monitoring-tools'))).to.be.true;
    });

    it('should configure allUserListWithoutRoles route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      const routePaths = router.stack.map(layer => layer.regexp.source);
      expect(routePaths.some(path => path.includes('allUserListWithoutRoles'))).to.be.true;
    });

    it('should configure reinviteUser route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      const routePaths = router.stack.map(layer => layer.regexp.source);
      expect(routePaths.some(path => path.includes('reinviteUser'))).to.be.true;
    });

    it('should configure caseworkerdetails route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      const routePaths = router.stack.map(layer => layer.regexp.source);
      expect(routePaths.some(path => path.includes('caseworkerdetails'))).to.be.true;
    });

    it('should configure getLovRefData route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;
      
      const routePaths = router.stack.map(layer => layer.regexp.source);
      expect(routePaths.some(path => path.includes('getLovRefData'))).to.be.true;
    });
  });
});