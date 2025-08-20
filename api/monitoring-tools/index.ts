import * as express from 'express';
import { getConfigValue } from '../configuration';
import { APP_INSIGHTS_CONNECTION_STRING } from '../configuration/references';
import * as log4jui from '../lib/log4jui';

const logger = log4jui.getLogger('monitoring-tools');

async function handleConnectionStringRoute(req, res) {
  try {
    logger.info('environmentConfig.appInsightsConnectionString is ' + getConfigValue(APP_INSIGHTS_CONNECTION_STRING));
    res.send({ connectionString: getConfigValue(APP_INSIGHTS_CONNECTION_STRING) });
  } catch (error) {
    const errReport = JSON.stringify({
      apiError: error,
      apiStatusCode: error.statusCode,
      message: 'List of users route error'
    });
    res.send(errReport).status(500);
  }
}

export const router = express.Router({ mergeParams: true });

router.get('/', handleConnectionStringRoute);

export default router;
