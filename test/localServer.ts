import 'source-map-support/register';

import * as ejs from 'ejs';
import * as express from 'express';
import * as path from 'path';
import { createApp, logger } from '../api/application';
import axios from 'axios'

// app.listen(port, () => logger.info(`Local server up at ${port}`));
class ApplicationServer {
    server: any
    app: any;

    async initialize() {
        this.app = await createApp();
        console.log('WE ARE USING server.ts on the box.');

        /**
         * Used Server side
         */
        this.app.engine('html', ejs.renderFile);
        this.app.set('view engine', 'html');
        this.app.set('views', __dirname);
        
        this.app.use(express.static(path.join(__dirname, '../dist/organisation-manager', 'assets'), { index: false }));
        this.app.use(express.static(path.join(__dirname, '../dist/organisation-manager'), { index: false }));
        
        /**
         * Used on server.ts only but should be fine to lift and shift to local.ts
         */
        this.app.use('/*', (req, res) => {
            console.time(`GET: ${req.originalUrl}`);
            res.render('../dist/organisation-manager/index', {
                providers: [{ provide: 'REQUEST', useValue: req }, { provide: 'RESPONSE', useValue: res }],
                req,
                res
            });
            console.timeEnd(`GET: ${req.originalUrl}`);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.log('Unhandled Rejection with:\n' + reason);
        });
        
        const port = process.env.PORT || 3000;
    }
    async start() {

        this.server = await this.app.listen(3000);
        try {
            const res = await axios.get('http://localhost:3000/auth/isAuthenticated')
            console.log(res.data)


        } catch (err) {
            console.log(err)

        }


    }

    async stop() {
        return await this.server.close()
    }


}

const applicationServer = new ApplicationServer();

// applicationServer.start()
export default applicationServer;

