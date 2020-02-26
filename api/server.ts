import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as ejs from 'ejs'
import * as express from 'express'
import * as session from 'express-session'
import * as helmet from 'helmet'
import * as path from 'path'
import * as process from 'process'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import {environmentCheckText, getConfigValue, getEnvironment} from './configuration'
import {ERROR_NODE_CONFIG_ENV} from './configuration/constants'
import {
  COOKIE_TOKEN,
  COOKIES_USERID, HELMET,
  IDAM_CLIENT,
  MAX_LINES, NOW, SECURE_COOKIE,
  SERVICES_CCD_DATA_API_PATH,
  SERVICES_CCD_DEF_API_PATH,
  SERVICES_IDAM_API_PATH,
  SESSION_SECRET,
} from './configuration/references'
import { appInsights } from './lib/appInsights'
import { errorStack } from './lib/errorStack'
import * as tunnel from './lib/tunnel'
import routes from './routes'

const FileStore = sessionFileStore(session)

const app = express()

/**
 * If there are no configuration properties found we highlight this to the person attempting to initialise
 * this application.
 */
if (!getEnvironment()) {
  console.log(ERROR_NODE_CONFIG_ENV)
}

/**
 * TODO: Implement a logger on the Node layer.
 */
console.log(environmentCheckText())

app.use(helmet(getConfigValue(HELMET)))

// TODO: Testing that we can get the environment variables on AAT from the .yaml file
console.log('COOKIE_TOKEN')
console.log(process.env.NODE_CONFIG_ENV)
console.log(getConfigValue(COOKIE_TOKEN))
console.log(getConfigValue(COOKIES_USERID))
console.log(getConfigValue(MAX_LINES))
console.log(getConfigValue(SERVICES_CCD_DATA_API_PATH))
console.log(getConfigValue(SERVICES_CCD_DEF_API_PATH))
console.log(getConfigValue(SERVICES_IDAM_API_PATH))
console.log(getConfigValue(SESSION_SECRET))
console.log(getConfigValue(IDAM_CLIENT))

app.use(
    session({
        cookie: {
            httpOnly: true,
            maxAge: 1800000,
            secure: getConfigValue(SECURE_COOKIE) !== false,
        },
        name: 'xuiaowebapp',
        resave: true,
        saveUninitialized: true,
        secret: getConfigValue(SESSION_SECRET) ,
        store: new FileStore({
            path: getConfigValue(NOW)  ? '/tmp/sessions' : '.sessions',
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

app.get('/oauth2/callback', auth.oauth)
app.get('/api/logout', (req, res) => {
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
