import { expect } from '../../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('lib/middleware/auth', () => {
  let xuiNodeStub: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./auth')];
    delete require.cache[require.resolve('@hmcts/rpx-xui-node-lib')];

    xuiNodeStub = {
      authenticate: sinon.stub()
    };

    sinon.stub(require('@hmcts/rpx-xui-node-lib'), 'xuiNode').value(xuiNodeStub);
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve('./auth')];
    delete require.cache[require.resolve('@hmcts/rpx-xui-node-lib')];
  });

  describe('default export', () => {
    it('should export xuiNode.authenticate', () => {
      const authMiddleware = require('./auth').default;

      expect(authMiddleware).to.equal(xuiNodeStub.authenticate);
    });

    it('should be a function reference', () => {
      xuiNodeStub.authenticate = () => 'auth-function';

      delete require.cache[require.resolve('./auth')];
      const authMiddleware = require('./auth').default;

      expect(authMiddleware()).to.equal('auth-function');
    });

    it('should maintain reference to original authenticate function', () => {
      const originalAuth = sinon.stub();
      xuiNodeStub.authenticate = originalAuth;

      delete require.cache[require.resolve('./auth')];
      const authMiddleware = require('./auth').default;

      expect(authMiddleware).to.equal(originalAuth);
    });
  });
});
