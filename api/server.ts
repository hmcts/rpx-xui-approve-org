
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as ejs from 'ejs'
import * as express from 'express'
import * as session from 'express-session'
import * as http from 'http'
import * as https from 'https'
import * as log4js from 'log4js'
import * as path from 'path'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import { appInsights } from './lib/appInsights'
import config from './lib/config'
import { errorStack } from './lib/errorStack'
import routes from './routes'

const FileStore = sessionFileStore(session)

const app = express()
const unsecureApp = express()

app.use(
    session({
        cookie: {
            httpOnly: false,
            maxAge: 1800000,
            secure: config.secureCookie !== false,
        },
        name: "xuiaowebapp",
        resave: true,
        saveUninitialized: true,
        secret: config.sessionSecret,
        store: new FileStore({
            path: process.env.NOW ? "/tmp/sessions" : ".sessions",
        })
    })
)

app.engine('html', ejs.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname)

app.use(express.static(path.join(__dirname, '..', 'assets'), { index: false }))
app.use(express.static(path.join(__dirname, '..'), { index: false }))

app.use(errorStack)
app.use(appInsights)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/oauth2/callback', auth.oauth)
unsecureApp.get('/health', (req, res, next) => {
  res.status(200)
  res.send('Healthy')
})
app.get('/api/logout', (req, res, next) => {
  auth.doLogout(req, res)
})

// Authenticated after this point.
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

const getSslCredentials = () => {
  return {
    key: '',
    cert: '',
  }
}

const httpServer = http.createServer(unsecureApp)
const httpsServer = https.createServer(getSslCredentials(), app)

const httpsPort = 443
httpsServer.listen(httpsPort, () => {
  console.log(`Https Server started on port ${httpsPort}`)
})
// TODO: httpServer should not serve the secure routes.

/**
 * We serve on a port.
 *
 * Note that /health is called by the build pipeline. If it's not able to be
 * hit 'Error: UPGRADE FAILED: "xui-ao-webapp-pr-122" has no deployed releases'
 * is thrown by the pipeline.
 */
httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`Http Server started on port ${process.env.PORT || 3000}`)
})
