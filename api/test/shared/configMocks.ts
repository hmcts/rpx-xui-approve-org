import * as sinon from 'sinon';

export interface ConfigValues {
  [key: string]: any;
}

export const createConfigMock = (configValues: ConfigValues = {}) => {
  const defaultConfig = {
    'S2S_SECRET': 'test-secret-key-123',
    'MICROSERVICE': 'xui_approveorg',
    'LOGGING': 'debug',
    'SERVICE_S2S_PATH': 'http://localhost:4502',
    'COOKIE_ROLES': 'roles',
    'maxLogLine': 80, // Fixed: use actual config key, not constant name
    'APP_INSIGHTS_CONNECTION_STRING': 'InstrumentationKey=test-key',
    'FEATURE_APP_INSIGHTS_ENABLED': 'true',
    ...configValues
  };

  return {
    getConfigValue: sinon.stub().callsFake((key: string) => defaultConfig[key]),
    showFeature: sinon.stub().callsFake((key: string) => defaultConfig[key] === 'true')
  };
};

export const mockAppInsights = {
  setup: sinon.stub().returnsThis(),
  setAutoDependencyCorrelation: sinon.stub().returnsThis(),
  setAutoCollectRequests: sinon.stub().returnsThis(),
  setAutoCollectPerformance: sinon.stub().returnsThis(),
  setAutoCollectExceptions: sinon.stub().returnsThis(),
  setAutoCollectDependencies: sinon.stub().returnsThis(),
  setAutoCollectConsole: sinon.stub().returnsThis(),
  setUseDiskRetryCaching: sinon.stub().returnsThis(),
  setSendLiveMetrics: sinon.stub().returnsThis(),
  start: sinon.stub(),
  defaultClient: {
    context: {
      tags: {},
      keys: { cloudRole: 'cloudRole' }
    },
    trackTrace: sinon.stub(),
    trackRequest: sinon.stub(),
    trackException: sinon.stub()
  }
};