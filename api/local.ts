import * as propertiesVolume from '@hmcts/properties-volume'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as process from 'process'

/**
 * Note that the NODE_CONFIG_DIR environmental variable needs to be setup as an environmental variable.
 *
 * Why? The NODE_CONFIG_DIR is used by Node-config to allow Node-config to point at a configuration outside of the node server directory.
 *
 * This is required as our Node service does not sit at our webserver root, it is run from api/ whereas our configuration files sit
 * at /config ( up one directory )
 *
 * NODE_CONFIG_DIR ie. - D:\home\site\wwwroot\config OR /Users/x/projects/rpx-xui-approve-org/config locally.
 *
 * @see node_modules config search for 'NODE_CONFIG_DIR'
 */
import * as config from 'config'
import * as setupConfig from './setupConfig'

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
 * Allows us to integrate the Azure key-vault flex volume, so that we are able to access Node configuration values.
 */
propertiesVolume.addTo(config)

// TODO: Rename
// These needs to throw errors back if something is not set.
setupConfig.checkConfigPropertiesSet()
setupConfig.checkEnvironment()

// If we leave it as is, then it's hard
// setup the environment config
environmentConfig.init()
// so now if it's working we need to initialise the config.

// TODO: Testing that we can get the environment variables on AAT from the .yaml file
console.log('COOKIE_TOKEN')
console.log(config.get('cookies.token'))
console.log(config.get('cookies.userId'))
console.log(config.get('exceptionOptions.maxLines'))
console.log(config.get('services.ccdDataApi'))
console.log(config.get('services.ccdDefApi'))
console.log(config.get('services.idamApi'))
console.log(config.get('sessionSecret'))
console.log(config.get('idamClient'))

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
