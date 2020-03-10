import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as passport from 'passport'
import * as process from "process"
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import { appInsights } from './lib/appInsights'
import { errorStack } from './lib/errorStack'
import * as log4jui from './lib/log4jui'
import * as tunnel from './lib/tunnel'
import routes from './routes'
const FileStore = sessionFileStore(session)
export const app = express()
const logger = log4jui.getLogger('server')
import * as healthcheck from '@hmcts/nodejs-healthcheck'
import { getConfigValue, showFeature } from './configuration'
import { FEATURE_SECURE_COOKIE_ENABLED, SESSION_SECRET } from './configuration/references'

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
    secret: getConfigValue(SESSION_SECRET),
    store: new FileStore({
      path: getConfigValue(NOW) ? '/tmp/sessions' : '.sessions',
    }),
  })
)

tunnel.init()

// app.use(errorStack)
app.use(appInsights)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((id, done) => {
  done(null, id)
})

// TODO: remove this when we have proper frontend configuration
app.use((req, res, next) => {
  // Set cookie for angular to know which config to use
  const platform = process.env.XUI_ENV || 'local'
  res.cookie('platform', platform)
  next()
})

function healthcheckConfig(msUrl) {
  return healthcheck.web(`${msUrl}/health`, {
    deadline: 6000,
    timeout: 6000,
  })
}

// const healthchecks = {
//   checks: {
//     ccdDataApi: healthcheckConfig(config.services.ccd.dataApi),
//     ccdDefApi: healthcheckConfig(config.services.ccd.componentApi),
//     dmStoreApi: healthcheckConfig(config.services.documents.api),
//     idamApi: healthcheckConfig(config.services.idam.idamApiUrl),
//     s2s: healthcheckConfig(config.services.s2s),
//   },
// }
//
// healthcheck.addTo(app, healthchecks)

app.use('/auth', auth.router)

app.get('/oauth2/callback',  (req: any, res, next) => {
  passport.authenticate('oidc', (error, user, info) => {

    // TODO: give a more meaningful error to user rather than redirect back to idam
    // return next(error) would pass off to error.handler.ts to show users a proper error page etc
    if (error) {
      logger.error(error)
      // return next(error)
    }
    if (info) {
      logger.info(info)
      // return next(info)
    }
    if (!user) {
      return res.redirect('/auth/login')
    }
    req.logIn(user, err => {
      if (err) {
        return next(err)
      }
      return auth.authCallbackSuccess(req, res)
    })
  })(req, res, next)
})

app.get('/api/logout', (req: any, res: any) => {
  auth.doLogout(req, res)
})

app.use('/api', routes)
