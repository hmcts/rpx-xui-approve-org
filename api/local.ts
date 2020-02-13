import * as healthcheck from '@hmcts/nodejs-healthcheck'
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

function healthcheckConfig(msUrl) {
  return healthcheck.web(`${msUrl}/health`, {
    deadline: 6000,
    timeout: 6000,
  })
}

const healthchecks = {
  checks: {
    ccdDataApi: healthcheckConfig(environmentConfig.services.ccdDataApi),
    ccdDefApi: healthcheckConfig(environmentConfig.services.ccdDefApi),
    feeAndPayApi: healthcheckConfig(environmentConfig.services.feeAndPayApi),
    idamApi: healthcheckConfig(environmentConfig.services.idamApi),
    idamWeb: healthcheckConfig(environmentConfig.services.idamWeb),
    rdProfessionalApi: healthcheckConfig(environmentConfig.services.rdProfessionalApi),
    s2s: healthcheckConfig(environmentConfig.services.s2s),
  },
}

healthcheck.addTo(app, healthchecks)

app.get('/oauth2/callback', auth.oauth)

app.use('/api', routes)

const port = process.env.PORT || 3001
app.listen(port, () => logger.info(`Local server up at ${port}`))
