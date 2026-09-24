import * as express from 'express';
import { getConfigValue } from '../configuration';
import { USER_TIMEOUT_IN_SECONDS } from '../configuration/references';
import * as log4jui from '../lib/log4jui';
const logger = log4jui.getLogger('auth');

export const router = express.Router({ mergeParams: true });
router.get('/details', handleUserRoute);

function handleUserRoute(req, res) {
  console.log('getConfigValue(USER_TIMEOUT_IN_SECONDS)', getConfigValue(USER_TIMEOUT_IN_SECONDS));
  const sessionUser = req.session.user || req.session.passport?.user?.userinfo || {};
  const UserDetails = {
    ...sessionUser,
    email: sessionUser.email || sessionUser.emailId || sessionUser.uid,
    idleTime: +getConfigValue(USER_TIMEOUT_IN_SECONDS) * 1000,
    timeout: 600
  };

  try {
    const payload = JSON.stringify(UserDetails);
    console.log(payload);
    res.send(payload);
  } catch (error) {
    logger.info(error);
    const errReport = JSON.stringify({ apiError: error, apiStatusCode: error.statusCode, message: '' });
    res.status(500).send(errReport);
  }
}
export default router;
