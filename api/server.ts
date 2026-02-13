import 'source-map-support/register';

import * as ejs from 'ejs';
import * as express from 'express';
import * as path from 'path';
import { idamCheck } from './idamCheck';
import * as log4jui from './lib/log4jui';

console.log('WE ARE USING server.ts on the box.');

const port = process.env.PORT || 3000;
const startupLogger = log4jui.getLogger('server');

idamCheck()
  .then(async () => {
    const { app, logger } = await import('./application');

    /**
     * Used Server side
     */
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'html');
    app.set('views', __dirname);

    app.use(express.static(path.join(__dirname, '..', 'assets'), { index: false }));
    app.use(express.static(path.join(__dirname, '..'), { index: false }));

    /**
     * Used on server.ts only but should be fine to lift and shift to local.ts
     */
    app.use('/*', (req, res) => {
      console.time(`GET: ${req.originalUrl}`);
      res.render('../index', {
        providers: [{ provide: 'REQUEST', useValue: req }, { provide: 'RESPONSE', useValue: res }],
        req,
        res
      });
      console.timeEnd(`GET: ${req.originalUrl}`);
    });

    app.listen(port, () => logger.info(`Local server up at ${port}`));
  })
  .catch((err) => {
    startupLogger.error('idam check failed after retries', err);
    process.exit(1);
  });
