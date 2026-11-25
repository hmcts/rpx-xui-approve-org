import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';

describe('errorHandler', () => {
  let internalLogger: any;
  let errorHandler: any;

  beforeEach(() => {
    internalLogger = {
      error: sinon.stub()
    };

    sinon.stub(require('./log4jui'), 'getLogger').returns({ _logger: internalLogger });
    delete require.cache[require.resolve('./error.handler')];
    errorHandler = require('./error.handler').default;
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve('./error.handler')];
  });

  it('should return error status and data when present', () => {
    const err = {
      data: { message: 'Downstream failure' },
      status: 502
    };
    const res = {
      headersSent: false,
      send: sinon.stub(),
      status: sinon.stub().returnsThis()
    } as any;
    const next = sinon.stub();

    errorHandler(err, {} as any, res, next);

    expect(internalLogger.error).to.have.been.calledWith(err.data);
    expect(res.status).to.have.been.calledWith(502);
    expect(res.send).to.have.been.calledWith(err.data);
    expect(next).not.to.have.been.called;
  });

  it('should return a generic 500 response when status and data are absent', () => {
    const err = new Error('route failure');
    const res = {
      headersSent: false,
      send: sinon.stub(),
      status: sinon.stub().returnsThis()
    } as any;
    const next = sinon.stub();

    errorHandler(err, {} as any, res, next);

    expect(internalLogger.error).to.have.been.calledWith(err.toString());
    expect(res.status).to.have.been.calledWith(500);
    expect(res.send).to.have.been.calledWith({ message: 'Internal Server Error' });
    expect(next).not.to.have.been.called;
  });

  it('should use statusCode when status is absent', () => {
    const err = {
      statusCode: 404
    };
    const res = {
      headersSent: false,
      send: sinon.stub(),
      status: sinon.stub().returnsThis()
    } as any;

    errorHandler(err, {} as any, res, sinon.stub());

    expect(res.status).to.have.been.calledWith(404);
    expect(res.send).to.have.been.calledWith({ message: 'Internal Server Error' });
  });

  it('should remove sensitive axios headers before logging', () => {
    const err = {
      config: {
        headers: {
          Authorization: 'Bearer token'
        }
      },
      data: { message: 'Bad gateway' },
      request: {
        _header: 'Authorization: Bearer token'
      },
      status: 502
    };
    const res = {
      headersSent: false,
      send: sinon.stub(),
      status: sinon.stub().returnsThis()
    } as any;

    errorHandler(err, {} as any, res, sinon.stub());

    expect(err.config).not.to.have.property('headers');
    expect(err.request).not.to.have.property('_header');
  });

  it('should delegate to the default handler when headers have already been sent', () => {
    const err = new Error('late route failure');
    const res = {
      headersSent: true,
      send: sinon.stub(),
      status: sinon.stub().returnsThis()
    } as any;
    const next = sinon.stub();

    errorHandler(err, {} as any, res, next);

    expect(next).to.have.been.calledWith(err);
    expect(res.status).not.to.have.been.called;
    expect(res.send).not.to.have.been.called;
  });
});
