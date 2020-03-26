import * as ejs from 'ejs'
import * as express from 'express'
import * as path from 'path'
<<<<<<< HEAD
import * as process from 'process'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import {environmentCheckText, getConfigValue, getEnvironment, showFeature} from './configuration'
import {ERROR_NODE_CONFIG_ENV} from './configuration/constants'
import {
  APP_INSIGHTS_KEY,
  COOKIE_ROLES,
  COOKIE_TOKEN,
  COOKIES_USERID,
  FEATURE_HELMET_ENABLED,
  FEATURE_SECURE_COOKIE_ENABLED,
  HELMET,
  IDAM_CLIENT,
  MAX_LINES,
  NOW,
  SERVICES_CCD_DATA_API_PATH,
  SERVICES_CCD_DEF_API_PATH,
  SERVICES_IDAM_API_PATH,
  SESSION_SECRET,
} from './configuration/references'
import {default as healthRouter} from './health'
import { appInsights } from './lib/appInsights'
import { errorStack } from './lib/errorStack'
import * as tunnel from './lib/tunnel'
import routes from './routes'
=======
import {app, logger} from './application'
>>>>>>> develop

console.log('WE ARE USING server.ts on the box.')

/**
 * Used Server side
 */
<<<<<<< HEAD
console.log(environmentCheckText())

console.log('APP_INSIGHTS:', getConfigValue(APP_INSIGHTS_KEY))

// TODO: Testing that we can get the environment variables on AAT from the .yaml file
console.log('COOKIE_TOKEN')
console.log(process.env.NODE_CONFIG_ENV)
console.log(getConfigValue(COOKIE_TOKEN))
console.log(getConfigValue(COOKIE_ROLES))
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
            secure: showFeature(FEATURE_SECURE_COOKIE_ENABLED),
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

=======
>>>>>>> develop
app.engine('html', ejs.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname)

app.use(express.static(path.join(__dirname, '..', 'assets'), { index: false }))
app.use(express.static(path.join(__dirname, '..'), { index: false }))

/**
 * Used on server.ts only but should be fine to lift and shift to local.ts
 */
app.use('/*', (req, res) => {
    console.time(`GET: ${req.originalUrl}`)
    res.render('../index', {
        providers: [{ provide: 'REQUEST', useValue: req }, { provide: 'RESPONSE', useValue: res }],
        req,
        res,
    })
    console.timeEnd(`GET: ${req.originalUrl}`)
})

const port = process.env.PORT || 3000

app.listen(port, () => logger.info(`Local server up at ${port}`))
