import * as healthcheck from '@hmcts/nodejs-healthcheck'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as ejs from 'ejs'
import * as express from 'express'
import * as session from 'express-session'
import * as path from 'path'
import * as process from 'process'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import { appInsights } from './lib/appInsights'
import { environmentConfig } from './lib/environment.config'
import { errorStack } from './lib/errorStack'
import * as tunnel from './lib/tunnel'
import routes from './routes'

const FileStore = sessionFileStore(session)

const app = express()

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

app.engine('html', ejs.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname)

app.use(express.static(path.join(__dirname, '..', 'assets'), { index: false }))
app.use(express.static(path.join(__dirname, '..'), { index: false }))

tunnel.init()

app.use(errorStack)
app.use(appInsights)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

/*function healthcheckConfig(msUrl) {
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

healthcheck.addTo(app, healthchecks)*/
app.get('/health', (req, res) => {
  res.status(200).send('ExpertUI is Up')
})

app.get('/oauth2/callback', auth.oauth)
app.get('/api/logout', (req, res, next) => {
    auth.doLogout(req, res)
})

app.use('/api', routes)

app.use('/*', (req, res) => {
    console.time(`GET: ${req.originalUrl}`)
    res.render('../index', {
        providers: [
            { provide: 'REQUEST', useValue: req },
            { provide: 'RESPONSE', useValue: res },
        ],
        req,
        res,
    })
    console.timeEnd(`GET: ${req.originalUrl}`)
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log('server running on port:', port) )
