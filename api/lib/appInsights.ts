import * as applicationInsights from 'applicationinsights';
import { getConfigValue, showFeature } from '../configuration';
import { APP_INSIGHTS_CONNECTION_STRING, FEATURE_APP_INSIGHTS_ENABLED } from '../configuration/references';

export let client;

const appInsightsConnectionString = getConfigValue<string>(APP_INSIGHTS_CONNECTION_STRING);
const hasValidAppInsightsConnectionString = /(?:^|;)InstrumentationKey=[^;]+/i.test(appInsightsConnectionString || '');

function initialiseAppInsights() {
  if (hasValidAppInsightsConnectionString) {
    applicationInsights
      .setup(appInsightsConnectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();

    client = applicationInsights.defaultClient;
    client.context.tags[client.context.keys.cloudRole] = 'xui-ao';
    client.trackTrace({ message: 'App Insight Activated' });
  } else {
    client = null;
    console.error('AppInsights enabled but no connection string provided.');
  }
}

if (showFeature(FEATURE_APP_INSIGHTS_ENABLED)) {
  initialiseAppInsights();
} else {
  client = null;
}
