import * as express from 'express';
import { healthEndpoints } from '../configuration/health';
import * as log4jui from '../lib/log4jui';

export const router = express.Router({ mergeParams: true });
const logger = log4jui.getLogger('outgoing');

router.get('/', healthCheckRoute);

/*
    Any feature that requires a health check
    will need to have its path declared as a
    property in the healthCheckEndpointDictionary.
    Then this property will need to have an array
    of api url's assigned to it.
*/

// TODO: set actual check values and set healthcheckguard on front end
const healthCheckEndpointDictionary = {
  '/organisation': ['rdProfessionalApi'],
  '/register-org/register/check': ['rdProfessionalApi'],
  '/users': ['rdProfessionalApi'],
  '/users/invite-user': ['rdProfessionalApi']
};

/*
    Health check endpoints are retrieved from
    environment json files. The "health" property
    inside an environment file is the exact copy
    of the "service" property, apart from the fact
    that an "/health" path is added at the end of
    each api url. The "service" property is not used
    in health check, because the url for a healthcheck
    endpoint may be different from a regular endpoint
*/

function getPromises(path, req): any[] {
  const Promises = [];
  if (healthCheckEndpointDictionary[path]) {
    healthCheckEndpointDictionary[path].forEach((endpoint) => {
      // TODO: Have health config for this.
      console.log('healthEndpoints');
      console.log(healthEndpoints()[endpoint]);
      Promises.push(req.get(healthEndpoints()[endpoint]));
    });
  }
  return Promises;
}

async function healthCheckRoute(req, res) {
  try {
    const path = req.query.path;
    let PromiseArr = [];
    let response = { healthState: true };

    if (path !== '') {
      PromiseArr = getPromises(path, req);
    }

    // comment out following block to bypass actual check
    await Promise.all(PromiseArr).then().catch(() => {
      response = { healthState: false };
    });

    logger.info('response::', response);
    res.send(response);
  } catch (error) {
    console.log(error);
    logger.info('error', { healthState: false });
    res.status(error.status).send({ healthState: false });
  }
}
export default router;
