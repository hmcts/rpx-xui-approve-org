import * as csurf from 'csurf';
import * as express from 'express';
import { uiConfig } from '../configuration/ui';
import * as log4jui from '../lib/log4jui';

const logger = log4jui.getLogger('configuration-ui');

export const router = express.Router({ mergeParams: true });

const csrfProtection = csurf();

router.get('/', csrfProtection, configurationUIRoute);

/**
 * Exposes runtime configuration for the UI (no auth), and ensures the session
 * and CSRF token cookie are initialised.
 */
export function configurationUIRoute(req, res): void {
  if (!req.session.env) {
    req.session.env = true;
    return req.session.save(() => {
      logger.info('new session saved! ', req.session.id);
      const csrfToken = req.csrfToken();
      logger.info('token for new session: ', csrfToken);
      res.cookie('XSRF-TOKEN', csrfToken);
      res.status(200).send(uiConfig());
      res.end();
    });
  }

  logger.info('existing session ', req.session.id);
  res.status(200).send(uiConfig());
}

export default router;

