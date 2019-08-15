import * as auth from './auth'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as ejs from 'ejs'
import * as session from 'express-session'
import * as path from 'path'
import * as sessionFileStore from 'session-file-store'
import * as fs from "fs"
import * as https from 'https'

import { appInsights } from './lib/appInsights'
import config from './lib/config'
import { errorStack } from './lib/errorStack'
import routes from './routes'
import * as http from "http";


const FileStore = sessionFileStore(session)

const app = express()
const httpApplication = express()

const httpPort = 3000

//TODO: Change to port 443, but make sure it all still works locally after change.
const httpsPort = 3001

app.use(
    session({
        cookie: {
            httpOnly: true,
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

const getSslCredentials = () => {
  return {
    key: fs.readFileSync('../ssl/server.key'),
    cert: fs.readFileSync('../ssl/server.crt'),
  }
}

httpApplication.get('/health', (req, res) => {
  res.status(200)
  res.send('Alive. Check is carried out by build process to make sure health is available on http port 3000.')
})

const httpServer = http.createServer(httpApplication)
const httpsServer = https.createServer(getSslCredentials(), app)

/**
 * Non-secure http content
 */
httpServer.listen(httpPort, () => {
  console.log(`Http Server started on port ${httpPort}`)
})

/**
 * Secure https content should be served over SSL, hence port 443.
 *
 * So this is working if you put https://localhost:443 or https://localhost in your browser
 * it will hit the Node service running on 443.
 *
 * TODO: What port is the node service running on the box?
 */
httpsServer.listen(httpsPort, () => {
  console.log(`Https Server started on port ${httpsPort}`)
})

// app.listen(process.env.PORT || 3000)
