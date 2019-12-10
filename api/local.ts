import * as propertiesVolume from '@hmcts/properties-volume'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as process from 'process'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import { appInsights } from './lib/appInsights'
import { environmentConfig } from './lib/environment.config'
import { errorStack } from './lib/errorStack'
import * as log4jui from './lib/log4jui'
import * as tunnel from './lib/tunnel'
import routes from './routes'

const FileStore = sessionFileStore(session)

const app = express()

/**
 * We get the root directory where the application is hosted.
 *
 * TODO: Will this work on higher environments? Where is the /config directory?
 * The Angular and Node layer must sit on the same box, therefore we require the path to it.
 */
// const getRootDirectory = () => __dirname + '/../../'
const getRootDirectory = () => '/Users/philip/projects/rpx-xui-approve-org'

/**
 * 
 * @returns {string}
 */
const getNodePath = () => process.env.NODE_PATH

/**
 * NODE_CONFIG_DIR environmental variable is a variable provided by Node-config to allow Node-config to be configured to point
 * to a different directory. This allows /config to be located outside of the node server directory.
 *
 * We need to leverage this as our Node service does not sit within our webserver root; it sits within /api and our
 * /config folder will sit at the root of our webserver - wwwroot.
 *
 * @see node_modules config
 */
process.env['NODE_CONFIG_DIR'] = getRootDirectory() + '/config'
console.log(process.env['NODE_CONFIG_DIR'])

import * as config from 'config'

/**
 * Allows us to integrate the Azure key-vault flex volume, so that we are able to access Node configuration values.
 */
propertiesVolume.addTo(config)

console.log(config.get('parent.child'))

const logger = log4jui.getLogger('server')

app.use(
    session({
        cookie: {
            httpOnly: true,
            maxAge: 1800000,
            secure: environmentConfig.secureCookie !== false,
        },
        name: 'xuiaowebapp',
        resave: true,
        saveUninitialized: true,
        secret: environmentConfig.sessionSecret,
        store: new FileStore({
            path: environmentConfig.now ? '/tmp/sessions' : '.sessions',
        }),
    })
)

tunnel.init()

app.use(errorStack)
app.use(appInsights)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/oauth2/callback', auth.oauth)

app.use('/api', routes)

const port = process.env.PORT || 3001
app.listen(port, () => logger.info(`Local server up at ${port}`))

// not defined.
// const dbConfig = config.get('Customer.dbConfig')
// console.log(dbConfig)
// console.log(config.get('testNode.testProperty'))
