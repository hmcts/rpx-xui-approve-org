import * as sinon from 'sinon';

export interface MockLogger {
  debug: sinon.SinonStub;
  info: sinon.SinonStub;
  warn: sinon.SinonStub;
  error: sinon.SinonStub;
  trackRequest: sinon.SinonStub;
  _logger: {
    level: string;
  };
}

export const createMockLogger = (): MockLogger => ({
  debug: sinon.stub(),
  info: sinon.stub(),
  warn: sinon.stub(),
  error: sinon.stub(),
  trackRequest: sinon.stub(),
  _logger: { level: 'debug' }
});

export const createLog4juiMock = () => ({
  getLogger: sinon.stub().returns(createMockLogger())
});