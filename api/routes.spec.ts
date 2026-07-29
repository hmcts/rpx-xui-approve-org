import { expect } from './test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

function layerMatchesPath(layer: any, path: string): boolean {
  if (layer.slash || layer.regexp?.fast_slash) {
    return false;
  }

  if (typeof layer.match === 'function') {
    return layer.match(path);
  }

  return Boolean(layer.regexp?.test(path));
}

function hasMountedPath(router: any, path: string): boolean {
  return router.stack.some((layer) => layerMatchesPath(layer, path));
}

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
      expect(layerMatchesPath(environmentRoute, '/environment/config')).to.be.true;
      expect(router.stack[1].handle).to.equal(mockXuiNode.authenticate);
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

      expect(hasMountedPath(router, '/user/details')).to.be.true;
      expect(hasMountedPath(router, '/decisions/states')).to.be.true;
      expect(hasMountedPath(router, '/organisations')).to.be.true;
      expect(hasMountedPath(router, '/pba/status/pending')).to.be.true;
    });

    it('should configure monitoring-tools route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;

      expect(hasMountedPath(router, '/monitoring-tools')).to.be.true;
    });

    it('should configure allUserListWithoutRoles route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;

      expect(hasMountedPath(router, '/allUserListWithoutRoles')).to.be.true;
    });

    it('should configure reinviteUser route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;

      expect(hasMountedPath(router, '/reinviteUser')).to.be.true;
    });

    it('should configure caseworkerdetails route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;

      expect(hasMountedPath(router, '/caseworkerdetails')).to.be.true;
    });

    it('should configure getLovRefData route', () => {
      delete require.cache[require.resolve('./routes')];
      const router = require('./routes').default;

      expect(hasMountedPath(router, '/getLovRefData')).to.be.true;
    });
  });
});
