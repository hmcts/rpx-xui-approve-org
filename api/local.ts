import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as globalTunnel from 'global-tunnel-ng'
import * as log4js from 'log4js'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import { appInsights } from './lib/appInsights'
import { environmentConfig } from './lib/environment.config'
import { errorStack } from './lib/errorStack'
import { exists } from './lib/util'
import routes from './routes'

const FileStore = sessionFileStore(session)

const app = express()
const logger = log4js.getLogger('server')
logger.level = environmentConfig.logging ? environmentConfig.logging : 'OFF'

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

if (exists(environmentConfig.proxy, 'host') && exists(environmentConfig.proxy, 'port')) {
  logger.info('configuring proxy tunnel: ', environmentConfig.proxy)
  globalTunnel.initialize({
      host: environmentConfig.proxy.host,
      port: environmentConfig.proxy.port,
  })
}

app.use(errorStack)
app.use(appInsights)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/oauth2/callback', auth.oauth)

app.use('/api', routes)

const port = environmentConfig.port || 3001
app.listen(port)

logger.info(`Local server up at ${port}`)
